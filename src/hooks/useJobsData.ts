import { useState, useCallback, useEffect } from 'react';
import { Job } from '../types/jobs';
import { JobCategory } from '../types/enums';
import { matchJobToConnections } from '../utils/connectionMatcher';
import { fetchWithRetry, APIError, formatErrorMessage } from '../utils/errorHandler';
import toast from 'react-hot-toast';

interface Listing {
  active: boolean;
  is_visible: boolean;
  category?: string;
  company_name: string;
  title: string;
  locations: string | string[];
  url: string;
  date_posted?: string | number;
  date_updated?: string | number;
}

interface UseJobsDataProps {
  selectedRoles: string[];
  hasConnections: boolean;
}

interface UseJobsDataReturn {
  jobs: Job[];
  loading: boolean;
  error: string | null;
  fetchJobs: () => Promise<void>;
  updateJobConnections: () => void;
}

/**
 * Maps job listing categories to standardized categories
 */
const categoryMap: { [key: string]: string[] } = {
  [JobCategory.SOFTWARE]: [
    'Software Engineering',
    'Software',
    'SWE',
    'Backend',
    'Frontend',
    'Full Stack',
    'Full-Stack',
  ],
  [JobCategory.AI_ML]: [
    'Data Science',
    'AI/ML/Data',
    'Data Analyst',
    'Data Engineer',
    'Machine Learning',
    'Data',
  ],
  [JobCategory.HARDWARE]: ['Hardware', 'Electrical', 'Embedded'],
  [JobCategory.PM]: ['Product Management', 'Product', 'PM'],
  [JobCategory.DESIGN]: ['Design', 'UX', 'UI'],
  [JobCategory.QUANT]: ['Quant', 'Quantitative'],
};

/**
 * Custom hook for fetching and managing job listings data
 * 
 * @param selectedRoles - Array of selected job categories
 * @param hasConnections - Whether user has imported connections
 * @returns Job data state and methods
 */
export const useJobsData = ({
  selectedRoles,
  hasConnections,
}: UseJobsDataProps): UseJobsDataReturn => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Parse date from listing (handles various formats)
   */
  const parseDate = (dateValue: string | number | null | undefined): Date | null => {
    if (!dateValue) return null;

    try {
      // If it's a timestamp in seconds, convert to milliseconds
      const timestamp =
        typeof dateValue === 'number'
          ? dateValue < 10000000000
            ? dateValue * 1000
            : dateValue
          : dateValue;

      const date = new Date(timestamp);
      return isNaN(date.getTime()) ? null : date;
    } catch {
      return null;
    }
  };

  /**
   * Fetch jobs from GitHub API
   */
  const fetchJobs = useCallback(async () => {
    if (selectedRoles.length === 0) {
      setJobs([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetchWithRetry(
        'https://raw.githubusercontent.com/SimplifyJobs/Summer2026-Internships/dev/.github/scripts/listings.json'
      );

      const listings: Listing[] = await response.json();

      // Filter and map listings to Job interface
      const mappedJobs: Job[] = listings
        .filter((listing: Listing) => {
          if (!listing.active || !listing.is_visible) return false;

          // If no categories selected, show all
          if (selectedRoles.length === 0) return true;

          // Check if listing category matches any selected category
          return selectedRoles.some((category) => {
            const keywords = categoryMap[category] || [category];
            return keywords.some((keyword) =>
              listing.category?.toLowerCase().includes(keyword.toLowerCase())
            );
          });
        })
        .map((listing: Listing) => {
          const datePosted = parseDate(listing.date_posted || listing.date_updated);

          // Generate a unique ID for the job
          const jobId = `${listing.company_name}-${listing.title}-${typeof listing.locations === 'string' ? listing.locations : listing.locations[0]}`
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '');

          const job: Job = {
            id: jobId,
            company: listing.company_name,
            role: listing.title,
            location: Array.isArray(listing.locations)
              ? listing.locations.join(', ')
              : listing.locations,
            contact: {
              name: 'Recruiting Team',
              title: 'Talent Acquisition',
              reason: `${listing.category || 'Internship'} opportunity - Apply through Simplify`,
            },
            url: listing.url,
            date_posted: datePosted,
            date_updated: parseDate(listing.date_updated),
            category: listing.category,
            connectionCount: 0,
            connectionMatches: [],
          };

          // Calculate connection matches if available
          if (hasConnections) {
            const matches = matchJobToConnections(job);
            job.connectionCount = matches.length;
            job.connectionMatches = matches;
          }

          return job;
        });

      setJobs(mappedJobs);
      toast.success(`Loaded ${mappedJobs.length} job opportunities`);
    } catch (err) {
      const errorMessage = formatErrorMessage(err);
      setError(errorMessage);
      
      if (err instanceof APIError && err.statusCode === 404) {
        toast.error('Job listings temporarily unavailable');
      } else {
        toast.error('Failed to fetch jobs');
      }
      
      console.error('Error fetching jobs:', err);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, [selectedRoles, hasConnections]);

  /**
   * Update connection counts for existing jobs
   */
  const updateJobConnections = useCallback(() => {
    if (jobs.length === 0) return;

    const updatedJobs = jobs.map((job) => {
      const matches = matchJobToConnections(job);
      return {
        ...job,
        connectionCount: matches.length,
        connectionMatches: matches,
      };
    });

    setJobs(updatedJobs);
  }, [jobs]);

  // Fetch jobs when selected roles change
  useEffect(() => {
    fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRoles, hasConnections]);

  return {
    jobs,
    loading,
    error,
    fetchJobs,
    updateJobConnections,
  };
};
