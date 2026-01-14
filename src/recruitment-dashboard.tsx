import React, { useState, useEffect, useMemo } from 'react';
import { Search, Briefcase, User, ExternalLink, Loader2, RefreshCw, Users, Upload, Trash2, SlidersHorizontal, Calendar, MapPin, TrendingUp, Info, X } from 'lucide-react';
import { ConnectionUploadModal } from './components/ConnectionUploadModal';
import { ConnectionsModal } from './components/ConnectionsModal';
import { connectionsStorage } from './utils/connectionsStorage';
import { matchJobToConnections, JobConnectionMatch, clearMatchCache } from './utils/connectionMatcher';

interface Contact {
  name: string;
  title: string;
  reason: string;
}

interface Job {
  company: string;
  role: string;
  location: string;
  contact: Contact;
  url?: string;
  date_posted?: string;
  date_updated?: string;
  category?: string;
  connectionCount?: number;
  connectionMatches?: JobConnectionMatch[]; // Cache matches with job
}

const RecruitmentDashboard = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<string[]>(['Software Engineering']);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showConnectionsModal, setShowConnectionsModal] = useState(false);
  const [selectedJobConnections, setSelectedJobConnections] = useState<{ connections: JobConnectionMatch[], company: string } | null>(null);
  const [hasConnections, setHasConnections] = useState(connectionsStorage.hasConnections());
  const [connectionCount, setConnectionCount] = useState(connectionsStorage.getConnections().length);
  const [sortBy, setSortBy] = useState<'connections' | 'date' | 'company'>('connections');
  const [showFilters, setShowFilters] = useState(false);
  const [locationFilter, setLocationFilter] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'week' | 'month'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Job category options matching the GitHub listing categories
  const categoryOptions = [
    { id: 'software', label: 'Software Engineering', category: 'Software Engineering' },
    { id: 'aiml', label: 'AI/ML/Data Science', category: 'Data Science' },
    { id: 'hardware', label: 'Hardware', category: 'Hardware' },
    { id: 'pm', label: 'Product Management', category: 'Product Management' },
    { id: 'design', label: 'Design', category: 'Design' },
    { id: 'quant', label: 'Quantitative', category: 'Quant' }
  ];

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://raw.githubusercontent.com/SimplifyJobs/Summer2026-Internships/dev/.github/scripts/listings.json');
      
      if (!response.ok) {
        throw new Error('Failed to fetch jobs');
      }

      const listings = await response.json();
      
      // Map categories to their variations in the listings
      const categoryMap: { [key: string]: string[] } = {
        'Software Engineering': ['Software Engineering', 'Software', 'SWE', 'Backend', 'Frontend', 'Full Stack', 'Full-Stack'],
        'Data Science': ['Data Science', 'AI/ML/Data', 'Data Analyst', 'Data Engineer', 'Machine Learning', 'Data'],
        'Hardware': ['Hardware', 'Electrical', 'Embedded'],
        'Product Management': ['Product Management', 'Product', 'PM'],
        'Design': ['Design', 'UX', 'UI'],
        'Quant': ['Quant', 'Quantitative']
      };

      // Filter for active internships and map to our Job interface
      const mappedJobs: Job[] = listings
        .filter((listing: any) => {
          if (!listing.active || !listing.is_visible) return false;
          
          // If no categories selected, show all
          if (selectedRoles.length === 0) return true;
          
          // Check if listing category matches any selected category
          return selectedRoles.some(category => {
            const keywords = categoryMap[category] || [category];
            return keywords.some(keyword => 
              listing.category?.toLowerCase().includes(keyword.toLowerCase())
            );
          });
        })
        .map((listing: any) => {
          // Handle date - could be timestamp, ISO string, or various formats
          let datePosted = null;
          if (listing.date_posted) {
            // If it's a timestamp in seconds, convert to milliseconds
            const timestamp = typeof listing.date_posted === 'number' 
              ? (listing.date_posted < 10000000000 ? listing.date_posted * 1000 : listing.date_posted)
              : listing.date_posted;
            datePosted = new Date(timestamp).toISOString();
          } else if (listing.date_updated) {
            const timestamp = typeof listing.date_updated === 'number'
              ? (listing.date_updated < 10000000000 ? listing.date_updated * 1000 : listing.date_updated)
              : listing.date_updated;
            datePosted = new Date(timestamp).toISOString();
          }

          return {
            company: listing.company_name,
            role: listing.title,
            location: Array.isArray(listing.locations) ? listing.locations.join(', ') : listing.locations,
            contact: {
              name: 'Recruiting Team',
              title: 'Talent Acquisition',
              reason: `${listing.category || 'Internship'} opportunity - Apply through Simplify`
            },
            url: listing.url,
            date_posted: datePosted,
            date_updated: listing.date_updated,
            category: listing.category,
            connectionCount: 0,
            connectionMatches: []
          };
        });

      // Calculate connection counts and cache matches for each job
      if (hasConnections) {
        mappedJobs.forEach(job => {
          const matches = matchJobToConnections(job);
          job.connectionCount = matches.length;
          job.connectionMatches = matches; // Cache matches
        });
      }

      setJobs(mappedJobs);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      alert('Failed to fetch jobs from GitHub. Please try again.');
      setJobs([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (selectedRoles.length > 0) {
      fetchJobs();
    } else {
      setJobs([]); // Clear jobs if no categories selected
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRoles, hasConnections]); // Fetch jobs when categories or connections change

  const toggleCategory = (category: string) => {
    setSelectedRoles(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleUploadSuccess = (count: number) => {
    clearMatchCache(); // Clear cache when connections change
    setHasConnections(true);
    setConnectionCount(count);
    // Recalculate connection counts for existing jobs
    if (jobs.length > 0) {
      const updatedJobs = jobs.map(job => {
        const matches = matchJobToConnections(job);
        return {
          ...job,
          connectionCount: matches.length,
          connectionMatches: matches // Cache matches
        };
      });
      setJobs(updatedJobs);
    }
  };

  const handleDeleteConnections = () => {
    if (window.confirm('Are you sure you want to delete all your imported connections? This cannot be undone.')) {
      connectionsStorage.deleteAll();
      clearMatchCache(); // Clear cache when connections deleted
      setHasConnections(false);
      setConnectionCount(0);
      setShowSettings(false);
      // Reset connection counts
      const updatedJobs = jobs.map(job => ({ 
        ...job, 
        connectionCount: 0,
        connectionMatches: []
      }));
      setJobs(updatedJobs);
    }
  };

  // Enhanced filtering - memoized for performance
  const filteredJobs = useMemo(() => {
    const searchLower = searchTerm.toLowerCase();
    const locationLower = locationFilter.toLowerCase();
    const now = Date.now();
    const weekMs = 7 * 24 * 60 * 60 * 1000;
    const monthMs = 30 * 24 * 60 * 60 * 1000;

    return jobs.filter((job: Job) => {
      // Text search
      if (searchTerm && !(job.company.toLowerCase().includes(searchLower) ||
        job.role.toLowerCase().includes(searchLower) ||
        job.location.toLowerCase().includes(searchLower))) {
        return false;
      }

      // Location filter
      if (locationFilter && !job.location.toLowerCase().includes(locationLower)) {
        return false;
      }

      // Date filter
      if (dateFilter !== 'all' && job.date_posted) {
        const postedTime = new Date(job.date_posted).getTime();
        const diff = now - postedTime;
        
        if (dateFilter === 'week' && diff > weekMs) {
          return false;
        } else if (dateFilter === 'month' && diff > monthMs) {
          return false;
        }
      }

      return true;
    });
  }, [jobs, searchTerm, locationFilter, dateFilter]);

  // Sorting - memoized for performance
  const sortedJobs = useMemo(() => {
    return [...filteredJobs].sort((a, b) => {
      switch (sortBy) {
        case 'connections':
          return (b.connectionCount || 0) - (a.connectionCount || 0);
        case 'date':
          if (!a.date_posted && !b.date_posted) return 0;
          if (!a.date_posted) return 1;
          if (!b.date_posted) return -1;
          return new Date(b.date_posted).getTime() - new Date(a.date_posted).getTime();
        case 'company':
          return a.company.localeCompare(b.company);
        default:
          return 0;
      }
    });
  }, [filteredJobs, sortBy]);

  // Pagination
  const totalPages = Math.ceil(sortedJobs.length / itemsPerPage);
  const paginatedJobs = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedJobs.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedJobs, currentPage, itemsPerPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, locationFilter, dateFilter, sortBy, selectedRoles]);

  // Helper to get company logo
  const getCompanyLogo = (companyName: string) => {
    // Use Clearbit Logo API - falls back gracefully if logo not found
    const domain = companyName.toLowerCase().replace(/[^a-z0-9]/g, '');
    return `https://img.logo.dev/${domain}.com?token=pk_Ojj9g7Q8QGK6Ph6zs4vy8Q`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
                Right2
              </h1>
              <p className="text-gray-600 mt-2 text-sm">
                right roles + right people
                {' | '}
                <button
                  onClick={() => setShowInfoModal(true)}
                  className="text-indigo-600 hover:text-indigo-700 font-medium inline-flex items-center gap-1 transition-colors"
                >
                  <Info size={10} />
                  How it works
                </button>
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {hasConnections ? (
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-lg hover:bg-emerald-700 transition-all shadow-sm font-medium text-sm"
                  title="Manage connections"
                >
                  <Users size={18} />
                  {connectionCount} connections
                </button>
              ) : (
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2.5 rounded-lg hover:bg-purple-700 transition-all shadow-sm font-medium text-sm animate-glow"
                >
                  <Upload size={18} />
                  Import LinkedIn
                </button>
              )}
              <button
                onClick={fetchJobs}
                disabled={loading || selectedRoles.length === 0}
                className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm font-medium text-sm"
              >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Loading...
                </>
              ) : (
                <>
                  <RefreshCw size={20} />
                  Refresh Jobs
                </>
              )}
            </button>
            </div>
          </div>

          {/* Connection Settings Panel */}
          {showSettings && hasConnections && (
            <div className="mb-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">LinkedIn Connections</h3>
                  <p className="text-sm text-gray-600">
                    {connectionCount} connections imported
                    {connectionsStorage.getMetadata() && (
                      <> • Last updated {new Date(connectionsStorage.getMetadata()!.imported_at).toLocaleDateString()}</>
                    )}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowUploadModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors"
                  >
                    <Upload size={16} />
                    Re-upload
                  </button>
                  <button
                    onClick={handleDeleteConnections}
                    className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    <Trash2 size={16} />
                    Delete All
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Select Job Categories:</h3>
            <div className="flex flex-wrap gap-2">
              {categoryOptions.map(option => (
                <button
                  key={option.id}
                  onClick={() => toggleCategory(option.category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedRoles.includes(option.category)
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search and Filters */}
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by company, role, or location..."
                  value={searchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg border transition-all ${
                  showFilters ? 'bg-indigo-50 border-indigo-300 text-indigo-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <SlidersHorizontal size={20} />
                Filters
              </button>
            </div>

            {/* Filter Panel */}
            {showFilters && (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Sort By */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <TrendingUp size={16} className="inline mr-1" />
                      Sort By
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="connections">Most Connections</option>
                      <option value="date">Newest First</option>
                      <option value="company">Company A-Z</option>
                    </select>
                  </div>

                  {/* Location Filter */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <MapPin size={16} className="inline mr-1" />
                      Location
                    </label>
                    <input
                      type="text"
                      placeholder="Filter by location..."
                      value={locationFilter}
                      onChange={(e) => setLocationFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>

                  {/* Date Filter */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Calendar size={16} className="inline mr-1" />
                      Posted Date
                    </label>
                    <select
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value as any)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="all">All Time</option>
                      <option value="week">Last 7 Days</option>
                      <option value="month">Last 30 Days</option>
                    </select>
                  </div>
                </div>

                {/* Results Summary */}
                <div className="mt-4 pt-4 border-t border-gray-300 flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Showing <span className="font-semibold">{sortedJobs.length}</span> of <span className="font-semibold">{jobs.length}</span> jobs
                  </p>
                  {(locationFilter || dateFilter !== 'all' || searchTerm) && (
                    <button
                      onClick={() => {
                        setLocationFilter('');
                        setDateFilter('all');
                        setSearchTerm('');
                      }}
                      className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                      Clear all filters
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-indigo-600 mb-4" size={48} />
            <p className="text-gray-600 font-medium">Loading opportunities...</p>
          </div>
        ) : (
          <>
            {/* Results Summary and Pagination Controls */}
            {sortedJobs.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-4">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold text-gray-900">{sortedJobs.length}</span> opportunities found
                  </p>
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600">Show:</label>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-medium"
                    >
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                  </div>
                </div>
                {totalPages > 1 && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-gray-700 px-3">
                      Page <span className="font-semibold">{currentPage}</span> of <span className="font-semibold">{totalPages}</span>
                    </span>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-3">
              {paginatedJobs.length === 0 && !loading && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                  <div className="max-w-md mx-auto">
                    <Briefcase className="text-gray-300 mx-auto mb-4" size={48} />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No opportunities found</h3>
                    <p className="text-gray-600 text-sm">
                      {jobs.length === 0 ? 'Select categories above to load opportunities' : 'Try adjusting your filters or search terms'}
                    </p>
                  </div>
                </div>
              )}
              {paginatedJobs.map((job: Job, index: number) => {
              // Use cached matches instead of recalculating
              const connectionMatches = job.connectionMatches || [];
              
              return (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all">
                <div className="p-5">
                  <div className="flex gap-4">
                    {/* Company Logo */}
                    <div className="flex-shrink-0">
                      <div className="w-14 h-14 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border-gray-200 flex items-center justify-center overflow-hidden">
                        <img
                          src={getCompanyLogo(job.company)}
                          alt={job.company}
                          className="w-10 h-10 object-contain"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent && !parent.querySelector('.fallback-text')) {
                              const fallback = document.createElement('div');
                              fallback.className = 'fallback-text text-base font-bold text-gray-400';
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
                          <h3 className="font-bold text-base text-gray-900 mb-0.5">{job.role}</h3>
                          <p className="font-semibold text-gray-700 text-sm">{job.company}</p>
                        </div>
                        {hasConnections && connectionMatches.length > 0 && (
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 whitespace-nowrap">
                            <Users size={13} />
                            {connectionMatches.length}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600 mb-3">
                        <span className="flex items-center gap-1">
                          <MapPin size={13} className="text-gray-400" />
                          {job.location}
                        </span>
                        {job.date_posted && (() => {
                          try {
                            const date = new Date(job.date_posted);
                            if (!isNaN(date.getTime()) && date.getFullYear() >= 2020) {
                              return (
                                <span className="flex items-center gap-1">
                                  <Calendar size={13} className="text-gray-400" />
                                  {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </span>
                              );
                            }
                          } catch (e) {}
                          return null;
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
                          >
                            Apply <ExternalLink size={12} />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Connections Section */}
                  {hasConnections && connectionMatches.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-start gap-2">
                        <User className="text-emerald-600 mt-0.5" size={16} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-700 mb-2">Your connections</p>
                          <div className="flex flex-wrap gap-2">
                            {connectionMatches.slice(0, 5).map((match: JobConnectionMatch, idx: number) => {
                              const connection = match.connection;
                              return (
                                <div key={idx} className="bg-emerald-50 border border-emerald-200 rounded-lg px-2.5 py-1.5">
                                  {connection.linkedin_url ? (
                                    <a
                                      href={connection.linkedin_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                                    >
                                      {connection.connection_name}
                                      <ExternalLink size={10} />
                                    </a>
                                  ) : (
                                    <p className="text-xs font-semibold text-emerald-700">{connection.connection_name}</p>
                                  )}
                                  <p className="text-xs text-gray-600 mt-0.5">{connection.job_title_raw || 'Employee'}</p>
                                </div>
                              );
                            })}
                            {connectionMatches.length > 5 && (
                              <button
                                onClick={() => {
                                  setSelectedJobConnections({ connections: connectionMatches, company: job.company });
                                  setShowConnectionsModal(true);
                                }}
                                className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 flex items-center hover:bg-gray-100 hover:border-gray-300 transition-colors cursor-pointer"
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
              </div>
            );
            })}
            </div>
          </>
        )}
      </div>

      {/* Connection Upload Modal */}
      <ConnectionUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSuccess={handleUploadSuccess}
      />

      {/* Info Modal */}
      {showInfoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Info className="text-indigo-600" />
                How It Works
              </h2>
              <button
                onClick={() => setShowInfoModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Overview */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Overview</h3>
                <p className="text-gray-700 leading-relaxed">
                  The job market moves fast. Applications can be lost even after hours of a role opening.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  I've experienced this myself- a role opens, I try to find a relevant connection to help me stand out, but by then I'm already applicant 4672!
                </p>
                <p className="text-gray-700 leading-relaxed">
                  So I built Right2. Powered by SimplifyJobs' Internship repo + a one time LinkedIn Connections import, you have all the roles and people ready upon release.
                </p>
              </div>

              {/* How It Works */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">How It Works</h3>
                <ol className="space-y-3 text-gray-700">
                  <li className="flex gap-3">
                    <span className="font-semibold text-indigo-600 flex-shrink-0">1.</span>
                    <span><strong>Browse Jobs:</strong> Select job categories to see active internship listings. Jobs are automatically refreshed from the latest available opportunities.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-semibold text-indigo-600 flex-shrink-0">2.</span>
                    <span><strong>Import LinkedIn Connections:</strong> Upload your LinkedIn connections CSV to see which companies you have existing connections at. Your data stays private and is stored locally in your browser.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-semibold text-indigo-600 flex-shrink-0">3.</span>
                    <span><strong>Find Matches:</strong> Jobs are automatically matched with your connections at each company. Higher connection counts mean more potential referral opportunities.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-semibold text-indigo-600 flex-shrink-0">4.</span>
                    <span><strong>Reach Out:</strong> Click on connection names to view their LinkedIn profiles and reach out for referrals or advice.</span>
                  </li>
                </ol>
              </div>

              {/* Privacy */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Privacy & Data</h3>
                <p className="text-gray-700 leading-relaxed">
                  Your LinkedIn connections are stored locally in your browser using localStorage. No data is sent to 
                  external servers. You can delete your connections at any time from the settings.
                </p>
              </div>

              {/* Credits */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Data Sources & Credits</h3>
                <div className="space-y-2 text-gray-700">
                  <p>
                    <strong>Job Listings:</strong> Powered by{' '}
                    <a
                      href="https://github.com/SimplifyJobs/Summer2026-Internships"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-700 underline inline-flex items-center gap-1"
                    >
                      SimplifyJobs/Summer2026-Internships
                      <ExternalLink size={14} />
                    </a>
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    A community-maintained repository of internship opportunities, updated regularly by contributors.
                  </p>
                </div>
              </div>

              {/* Feedback */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Feedback</h3>
                <div className="space-y-2 text-gray-700">
                  <p>
                    Notice any issues or want to see a new feature? Check out the <a href="https://github.com/aprabou/RIght2" target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-700 underline inline-flex items-center gap-1">
                        Right2 Repo
                      </a> on how to contribute.
                  </p>
                </div>
              </div>

              {/* Close Button */}
              <div className="border-t border-gray-200 pt-6">
                <button
                  onClick={() => setShowInfoModal(false)}
                  className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                >
                  Got it!
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Connections Modal */}
      {selectedJobConnections && (
        <ConnectionsModal
          isOpen={showConnectionsModal}
          onClose={() => {
            setShowConnectionsModal(false);
            setSelectedJobConnections(null);
          }}
          connections={selectedJobConnections.connections}
          companyName={selectedJobConnections.company}
        />
      )}
    </div>
  );
};

export default RecruitmentDashboard;