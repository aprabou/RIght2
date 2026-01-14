// User connection data structure
export interface UserConnection {
  id: string;
  user_id: string;
  connection_name: string;
  company_name_raw: string;
  company_name_normalized: string;
  job_title_raw: string;
  job_title_normalized: string;
  connection_date?: string;
  linkedin_url?: string;
  source: 'linkedin_csv';
  last_updated_at: string;
}

// CSV row structure from LinkedIn export
export interface LinkedInCSVRow {
  'First Name': string;
  'Last Name': string;
  'URL': string;
  'Company': string;
  'Position': string;
  'Connected On'?: string;
  'Email Address'?: string;
}

// Connection import metadata
export interface ConnectionImportMetadata {
  imported_at: string;
  connection_count: number;
  source: 'linkedin_csv';
}
