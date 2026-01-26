/**
 * Job category enumerations
 */
export enum JobCategory {
  SOFTWARE = 'Software Engineering',
  AI_ML = 'Data Science',
  HARDWARE = 'Hardware',
  PM = 'Product Management',
  DESIGN = 'Design',
  QUANT = 'Quant',
}

/**
 * Sort options for job listings
 */
export enum SortOption {
  CONNECTIONS = 'connections',
  DATE = 'date',
  COMPANY = 'company',
}

/**
 * Date filter options
 */
export enum DateFilter {
  ALL = 'all',
  WEEK = 'week',
  MONTH = 'month',
}

/**
 * Loading state status
 */
export enum LoadingStatus {
  IDLE = 'idle',
  LOADING = 'loading',
  SUCCESS = 'success',
  ERROR = 'error',
}
