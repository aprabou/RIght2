import React from 'react';
import { Briefcase } from 'lucide-react';
import { Job } from '../types/jobs';
import { JobCard } from './JobCard';
import { JobConnectionMatch } from '../utils/connectionMatcher';

interface JobListProps {
  jobs: Job[];
  hasConnections: boolean;
  onViewConnections: (connections: JobConnectionMatch[], company: string) => void;
}

/**
 * Component for rendering list of job cards
 */
export const JobList: React.FC<JobListProps> = ({
  jobs,
  hasConnections,
  onViewConnections,
}) => {
  if (jobs.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <div className="max-w-md mx-auto">
          <Briefcase className="text-gray-300 mx-auto mb-4" size={48} />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No opportunities found
          </h3>
          <p className="text-gray-600 text-sm">
            Try adjusting your filters or search terms
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3" role="list" aria-label="Job listings">
      {jobs.map((job: Job, index: number) => (
        <JobCard
          key={`${job.company}-${job.role}-${index}`}
          job={job}
          hasConnections={hasConnections}
          onViewConnections={onViewConnections}
        />
      ))}
    </div>
  );
};
