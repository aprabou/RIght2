import { UserConnection, ConnectionImportMetadata } from '../types/connections';

const STORAGE_KEY_CONNECTIONS = 'linkedin_connections';
const STORAGE_KEY_METADATA = 'linkedin_connections_metadata';
const STORAGE_KEY_CSV_CACHE = 'linkedin_csv_cache';

// Storage utilities for user connections (localStorage simulates user-scoped data)
export const connectionsStorage = {
  // Get all connections for current user
  getConnections(): UserConnection[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_CONNECTIONS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading connections:', error);
      return [];
    }
  },

  // Save connections (replaces existing)
  saveConnections(connections: UserConnection[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_CONNECTIONS, JSON.stringify(connections));
    } catch (error) {
      console.error('Error saving connections:', error);
      throw new Error('Failed to save connections');
    }
  },

  // Get import metadata
  getMetadata(): ConnectionImportMetadata | null {
    try {
      const data = localStorage.getItem(STORAGE_KEY_METADATA);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error reading metadata:', error);
      return null;
    }
  },

  // Save import metadata
  saveMetadata(metadata: ConnectionImportMetadata): void {
    try {
      localStorage.setItem(STORAGE_KEY_METADATA, JSON.stringify(metadata));
    } catch (error) {
      console.error('Error saving metadata:', error);
    }
  },

  // Cache raw CSV content
  cacheCSV(csvContent: string): void {
    try {
      localStorage.setItem(STORAGE_KEY_CSV_CACHE, csvContent);
    } catch (error) {
      console.error('Error caching CSV:', error);
      // If storage is full, try to clear old data
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        console.warn('Storage quota exceeded, CSV cache not saved');
      }
    }
  },

  // Get cached CSV content
  getCachedCSV(): string | null {
    try {
      return localStorage.getItem(STORAGE_KEY_CSV_CACHE);
    } catch (error) {
      console.error('Error reading cached CSV:', error);
      return null;
    }
  },

  // Check if CSV cache exists
  hasCachedCSV(): boolean {
    return !!this.getCachedCSV();
  },

  // Delete all connections and metadata
  deleteAll(): void {
    try {
      localStorage.removeItem(STORAGE_KEY_CONNECTIONS);
      localStorage.removeItem(STORAGE_KEY_METADATA);
      localStorage.removeItem(STORAGE_KEY_CSV_CACHE);
    } catch (error) {
      console.error('Error deleting connections:', error);
      throw new Error('Failed to delete connections');
    }
  },

  // Check if connections exist
  hasConnections(): boolean {
    return this.getConnections().length > 0;
  }
};

// Company name normalization utilities
export const normalizeCompanyName = (companyName: string): string => {
  if (!companyName) return '';
  
  return companyName
    .toLowerCase()
    .trim()
    // Remove common suffixes
    .replace(/\s+(inc\.?|llc\.?|corp\.?|corporation|ltd\.?|limited|co\.?)$/i, '')
    // Remove extra whitespace
    .replace(/\s+/g, ' ')
    .trim();
};

// Job title normalization utilities
export const normalizeJobTitle = (title: string): string => {
  if (!title) return '';
  
  return title
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .trim();
};

// Fuzzy match for company names
export const fuzzyMatchCompany = (company1: string, company2: string): boolean => {
  const normalized1 = normalizeCompanyName(company1);
  const normalized2 = normalizeCompanyName(company2);
  
  // Exact match
  if (normalized1 === normalized2) return true;
  
  // Check if one contains the other (for cases like "Google" vs "Google Inc.")
  if (normalized1.includes(normalized2) || normalized2.includes(normalized1)) {
    return true;
  }
  
  // Check for common abbreviations or variations
  const words1 = normalized1.split(' ');
  const words2 = normalized2.split(' ');
  
  // If they share significant words
  const commonWords = words1.filter(word => 
    word.length > 3 && words2.includes(word)
  );
  
  return commonWords.length > 0 && commonWords.length >= Math.min(words1.length, words2.length) / 2;
};
