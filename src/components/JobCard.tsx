import React from 'react';
import { ExternalLink, MapPin, Calendar, Users, User } from 'lucide-react';
import { Job } from '../types/jobs';
import { JobConnectionMatch } from '../utils/connectionMatcher';

interface JobCardProps {
  job: Job;
  hasConnections: boolean;
  onViewConnections: (connections: JobConnectionMatch[], company: string) => void;
}

/**
 * Individual job card component
 */
export const JobCard: React.FC<JobCardProps> = ({
  job,
  hasConnections,
  onViewConnections,
}) => {
  const connectionMatches = job.connectionMatches || [];

  /**
   * Get company logo using Clearbit API
   */
  const getCompanyLogo = (companyName: string): string => {
    const domain = companyName.toLowerCase().replace(/[^a-z0-9]/g, '');
    return `https://img.logo.dev/${domain}.com?token=pk_Ojj9g7Q8QGK6Ph6zs4vy8Q`;
  };

  /**
   * Format date for display
   */
  const formatDate = (date: Date | null): string | null => {
    if (!date) return null;

    try {
      if (date.getFullYear() < 2020) return null;
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return null;
    }
  };

  return (
    <article
      className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all"
      aria-label={`${job.role} at ${job.company}`}
    >
      <div className="p-5">
        <div className="flex gap-4">
          {/* Company Logo */}
          <div className="flex-shrink-0">
            <div className="w-14 h-14 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border-gray-200 flex items-center justify-center overflow-hidden">
              <img
                src={getCompanyLogo(job.company)}
                alt={`${job.company} logo`}
                className="w-10 h-10 object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent && !parent.querySelector('.fallback-text')) {
                    const fallback = document.createElement('div');
                    fallback.className =
                      'fallback-text text-base font-bold text-gray-400';
                    fallback.textContent = job.company.substring(0, 2).toUpperCase();
                    parent.appendChild(fallback);
                  }
                }}
              />
            </div>
          </div>

          {/* Job Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-base text-gray-900 mb-0.5">
                  {job.role}
                </h3>
                <p className="font-semibold text-gray-700 text-sm">{job.company}</p>
              </div>
              {hasConnections && connectionMatches.length > 0 && (
                <div
                  className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 whitespace-nowrap"
                  role="status"
                  aria-label={`${connectionMatches.length} connection${connectionMatches.length !== 1 ? 's' : ''}`}
                >
                  <Users size={13} aria-hidden="true" />
                  {connectionMatches.length}
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600 mb-3">
              <span className="flex items-center gap-1">
                <MapPin size={13} className="text-gray-400" aria-hidden="true" />
                {job.location}
              </span>
              {job.date_posted && (() => {
                const formattedDate = formatDate(job.date_posted);
                return formattedDate ? (
                  <span className="flex items-center gap-1">
                    <Calendar size={13} className="text-gray-400" aria-hidden="true" />
                    {formattedDate}
                  </span>
                ) : null;
              })()}
              {job.category && (
                <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-medium border border-blue-100">
                  {job.category}
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {job.url && (
                <a
                  href={job.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 font-semibold transition-colors"
                  aria-label={`Apply for ${job.role} at ${job.company} (opens in new tab)`}
                >
                  Apply <ExternalLink size={12} aria-hidden="true" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Connections Section */}
        {hasConnections && connectionMatches.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-start gap-2">
              <User
                className="text-emerald-600 mt-0.5"
                size={16}
                aria-hidden="true"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-700 mb-2">
                  Your connections
                </p>
                <div className="flex flex-wrap gap-2">
                  {connectionMatches.slice(0, 5).map((match: JobConnectionMatch, idx: number) => {
                    const connection = match.connection;
                    return (
                      <div
                        key={idx}
                        className="bg-emerald-50 border border-emerald-200 rounded-lg px-2.5 py-1.5"
                      >
                        {connection.linkedin_url ? (
                          <a
                            href={connection.linkedin_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                            aria-label={`View ${connection.connection_name} on LinkedIn`}
                          >
                            {connection.connection_name}
                            <ExternalLink size={10} aria-hidden="true" />
                          </a>
                        ) : (
                          <p className="text-xs font-semibold text-emerald-700">
                            {connection.connection_name}
                          </p>
                        )}
                        <p className="text-xs text-gray-600 mt-0.5">
                          {connection.job_title_raw || 'Employee'}
                        </p>
                      </div>
                    );
                  })}
                  {connectionMatches.length > 5 && (
                    <button
                      onClick={() => onViewConnections(connectionMatches, job.company)}
                      className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 flex items-center hover:bg-gray-100 hover:border-gray-300 transition-colors cursor-pointer"
                      aria-label={`View all ${connectionMatches.length} connections at ${job.company}`}
                    >
                      <p className="text-xs text-gray-600 font-medium">
                        +{connectionMatches.length - 5} more
                      </p>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </article>
  );
};
