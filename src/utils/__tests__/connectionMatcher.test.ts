import { matchJobToConnections, getConnectionCountForCompany, clearMatchCache } from '../connectionMatcher';
import { connectionsStorage } from '../connectionsStorage';
import { Job } from '../../types/jobs';

// Mock connectionsStorage
jest.mock('../connectionsStorage');

const mockConnections = [
  {
    id: '1',
    user_id: 'test',
    connection_name: 'John Doe',
    company_name_raw: 'Google',
    company_name_normalized: 'google',
    job_title_raw: 'Software Engineer',
    job_title_normalized: 'software engineer',
    source: 'linkedin_csv' as const,
    last_updated_at: '2024-01-01',
  },
  {
    id: '2',
    user_id: 'test',
    connection_name: 'Jane Smith',
    company_name_raw: 'Google LLC',
    company_name_normalized: 'google',
    job_title_raw: 'Senior Recruiter',
    job_title_normalized: 'senior recruiter',
    source: 'linkedin_csv' as const,
    last_updated_at: '2024-01-01',
  },
  {
    id: '3',
    user_id: 'test',
    connection_name: 'Bob Johnson',
    company_name_raw: 'Microsoft',
    company_name_normalized: 'microsoft',
    job_title_raw: 'Product Manager',
    job_title_normalized: 'product manager',
    source: 'linkedin_csv' as const,
    last_updated_at: '2024-01-01',
  },
];

describe('connectionMatcher', () => {
  beforeEach(() => {
    clearMatchCache();
    (connectionsStorage.getConnections as jest.Mock).mockReturnValue(mockConnections);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('matchJobToConnections', () => {
    it('should match jobs by exact company name', () => {
      const job: Job = {
        company: 'Google',
        role: 'Software Engineer Intern',
        location: 'Mountain View, CA',
        contact: { name: 'Test', title: 'Test', reason: 'Test' },
        date_posted: null,
        date_updated: null,
        connectionCount: 0,
        connectionMatches: [],
      };

      const matches = matchJobToConnections(job);
      expect(matches.length).toBe(2); // John and Jane both work at Google
      expect(matches[0].connection.company_name_normalized).toBe('google');
    });

    it('should return empty array for companies with no connections', () => {
      const job: Job = {
        company: 'Unknown Company',
        role: 'Engineer',
        location: 'Remote',
        contact: { name: 'Test', title: 'Test', reason: 'Test' },
        date_posted: null,
        date_updated: null,
        connectionCount: 0,
        connectionMatches: [],
      };

      const matches = matchJobToConnections(job);
      expect(matches).toEqual([]);
    });

    it('should boost score for relevant positions', () => {
      const job: Job = {
        company: 'Google',
        role: 'Software Engineer Intern',
        location: 'Mountain View, CA',
        contact: { name: 'Test', title: 'Test', reason: 'Test' },
        date_posted: null,
        date_updated: null,
        connectionCount: 0,
        connectionMatches: [],
      };

      const matches = matchJobToConnections(job);
      
      // Jane (recruiter) should have higher score than base
      const recruiterMatch = matches.find((m: { connection: { connection_name: string } }) => m.connection.connection_name === 'Jane Smith');
      expect(recruiterMatch?.matchScore).toBeGreaterThan(1.0);
    });

    it('should cache results', () => {
      const job: Job = {
        company: 'Google',
        role: 'Engineer',
        location: 'Remote',
        contact: { name: 'Test', title: 'Test', reason: 'Test' },
        date_posted: null,
        date_updated: null,
        connectionCount: 0,
        connectionMatches: [],
      };

      // First call
      matchJobToConnections(job);
      expect(connectionsStorage.getConnections).toHaveBeenCalledTimes(1);

      // Second call should use cache
      matchJobToConnections(job);
      expect(connectionsStorage.getConnections).toHaveBeenCalledTimes(1);
    });
  });

  describe('getConnectionCountForCompany', () => {
    it('should return correct count for company with connections', () => {
      const count = getConnectionCountForCompany('Google');
      expect(count).toBe(2);
    });

    it('should return 0 for company without connections', () => {
      const count = getConnectionCountForCompany('Unknown Company');
      expect(count).toBe(0);
    });
  });

  describe('clearMatchCache', () => {
    it('should clear the match cache', () => {
      const job: Job = {
        company: 'Google',
        role: 'Engineer',
        location: 'Remote',
        contact: { name: 'Test', title: 'Test', reason: 'Test' },
        date_posted: null,
        date_updated: null,
        connectionCount: 0,
        connectionMatches: [],
      };

      // Cache a result
      matchJobToConnections(job);
      expect(connectionsStorage.getConnections).toHaveBeenCalledTimes(1);

      // Clear cache
      clearMatchCache();

      // Should fetch again
      matchJobToConnections(job);
      expect(connectionsStorage.getConnections).toHaveBeenCalledTimes(2);
    });
  });
});
