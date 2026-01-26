import { UserConnection } from '../types/connections';
import { connectionsStorage, normalizeCompanyName } from './connectionsStorage';

export interface JobConnectionMatch {
  connection: UserConnection;
  matchScore: number;
  matchReason: string;
}

export interface Job {
  company: string;
  role: string;
  location: string;
  url?: string;
}

// Cache for connection matches to avoid recomputing
const matchCache = new Map<string, JobConnectionMatch[]>();

// Build a company-to-connections lookup map for O(1) access
let companyLookupCache: Map<string, UserConnection[]> | null = null;
let cachedConnectionsLength = 0;

const buildCompanyLookup = (): Map<string, UserConnection[]> => {
  const connections = connectionsStorage.getConnections();
  
  // Only rebuild if connections have changed
  if (companyLookupCache && connections.length === cachedConnectionsLength) {
    return companyLookupCache;
  }

  const lookup = new Map<string, UserConnection[]>();
  for (const connection of connections) {
    const normalized = connection.company_name_normalized;
    if (!lookup.has(normalized)) {
      lookup.set(normalized, []);
    }
    const list = lookup.get(normalized);
    if (list) {
      list.push(connection);
    }
  }
  
  companyLookupCache = lookup;
  cachedConnectionsLength = connections.length;
  return lookup;
};

// Clear caches when connections change
export const clearMatchCache = () => {
  matchCache.clear();
  companyLookupCache = null;
  cachedConnectionsLength = 0;
};

// Match job to user's connections - uses exact company matching with caching
export const matchJobToConnections = (job: Job): JobConnectionMatch[] => {
  // Check cache first
  const cacheKey = `${job.company}|${job.role}`;
  const cachedResult = matchCache.get(cacheKey);
  if (cachedResult) {
    return cachedResult;
  }

  const companyLookup = buildCompanyLookup();
  const jobCompanyNormalized = normalizeCompanyName(job.company);
  
  // O(1) lookup instead of O(n) iteration
  const companyConnections = companyLookup.get(jobCompanyNormalized);
  
  if (!companyConnections || companyConnections.length === 0) {
    matchCache.set(cacheKey, []);
    return [];
  }

  const matches: JobConnectionMatch[] = [];
  const jobRoleNormalized = job.role?.toLowerCase();

  for (const connection of companyConnections) {
    let matchScore = 1.0; // Base score for company match
    let matchReason = `Works at ${connection.company_name_raw}`;

    // Boost score if job title is relevant
    if (connection.job_title_normalized && jobRoleNormalized) {
      const connectionTitleNormalized = connection.job_title_normalized;

      // Check for role similarity
      if (isRoleSimilar(jobRoleNormalized, connectionTitleNormalized)) {
        matchScore += 0.5;
        matchReason = `${connection.job_title_raw} at ${connection.company_name_raw}`;
      }

      // Check if they're in relevant positions (recruiter, hiring manager, etc.)
      if (isRelevantPosition(connectionTitleNormalized)) {
        matchScore += 0.3;
        matchReason += ' (Hiring/Recruiting)';
      }
    }

    matches.push({
      connection,
      matchScore,
      matchReason
    });
  }

  // Sort by match score (highest first)
  matches.sort((a, b) => b.matchScore - a.matchScore);

  // Cache the result
  matchCache.set(cacheKey, matches);
  
  return matches;
};

// Check if two roles are similar
const isRoleSimilar = (role1: string, role2: string): boolean => {
  // Direct match
  if (role1.includes(role2) || role2.includes(role1)) {
    return true;
  }

  // Check for common role keywords
  const role1Keywords = extractRoleKeywords(role1);
  const role2Keywords = extractRoleKeywords(role2);

  const commonKeywords = role1Keywords.filter(keyword => 
    role2Keywords.includes(keyword)
  );

  // If they share 50%+ of keywords, consider them similar
  return commonKeywords.length >= Math.min(role1Keywords.length, role2Keywords.length) / 2;
};

// Extract important keywords from role title
const extractRoleKeywords = (role: string): string[] => {
  const keywords: string[] = [];
  const roleLower = role.toLowerCase();

  // Technical roles
  const techKeywords = ['software', 'engineer', 'developer', 'programmer', 'architect', 
    'data', 'machine learning', 'ml', 'ai', 'frontend', 'backend', 'fullstack', 'full stack',
    'devops', 'sre', 'qa', 'test', 'mobile', 'ios', 'android', 'web'];

  // Seniority levels
  const seniorityKeywords = ['intern', 'junior', 'senior', 'lead', 'principal', 'staff',
    'manager', 'director', 'vp', 'head', 'chief'];

  // Specializations
  const specializationKeywords = ['security', 'cloud', 'infrastructure', 'platform',
    'embedded', 'systems', 'network', 'database'];

  const allKeywords = [...techKeywords, ...seniorityKeywords, ...specializationKeywords];

  for (const keyword of allKeywords) {
    if (roleLower.includes(keyword)) {
      keywords.push(keyword);
    }
  }

  return keywords;
};

// Check if connection is in a relevant position for job referrals
const isRelevantPosition = (title: string): boolean => {
  const relevantTerms = [
    'recruiter', 'recruiting', 'talent', 'hr', 'human resources',
    'hiring', 'manager', 'director', 'lead', 'head', 'vp',
    'chief', 'cto', 'ceo', 'founder'
  ];

  const titleLower = title.toLowerCase();
  return relevantTerms.some(term => titleLower.includes(term));
};

// Get connection count for a specific company - uses exact company matching with cache
export const getConnectionCountForCompany = (companyName: string): number => {
  const companyLookup = buildCompanyLookup();
  const companyNormalized = normalizeCompanyName(companyName);
  
  const connections = companyLookup.get(companyNormalized);
  return connections ? connections.length : 0;
};

// Get all connections grouped by company
export const getConnectionsByCompany = (): Map<string, UserConnection[]> => {
  const connections = connectionsStorage.getConnections();
  const grouped = new Map<string, UserConnection[]>();

  for (const connection of connections) {
    const company = connection.company_name_raw;
    if (!grouped.has(company)) {
      grouped.set(company, []);
    }
    const list = grouped.get(company);
    if (list) {
      list.push(connection);
    }
  }

  return grouped;
};
