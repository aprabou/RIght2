import { normalizeCompanyName, normalizeJobTitle, fuzzyMatchCompany } from '../connectionsStorage';

describe('connectionsStorage utilities', () => {
  describe('normalizeCompanyName', () => {
    it('should convert to lowercase', () => {
      expect(normalizeCompanyName('Google')).toBe('google');
    });

    it('should remove common suffixes', () => {
      expect(normalizeCompanyName('Microsoft Inc.')).toBe('microsoft');
      expect(normalizeCompanyName('Apple LLC')).toBe('apple');
      expect(normalizeCompanyName('Amazon Corp.')).toBe('amazon');
    });

    it('should trim whitespace', () => {
      expect(normalizeCompanyName('  Meta  ')).toBe('meta');
    });

    it('should handle empty strings', () => {
      expect(normalizeCompanyName('')).toBe('');
    });

    it('should normalize extra whitespace', () => {
      expect(normalizeCompanyName('SpaceX   Technologies')).toBe('spacex technologies');
    });
  });

  describe('normalizeJobTitle', () => {
    it('should convert to lowercase and trim', () => {
      expect(normalizeJobTitle('Software Engineer')).toBe('software engineer');
    });

    it('should handle empty strings', () => {
      expect(normalizeJobTitle('')).toBe('');
    });

    it('should normalize whitespace', () => {
      expect(normalizeJobTitle('Senior  Software   Engineer')).toBe(
        'senior software engineer'
      );
    });
  });

  describe('fuzzyMatchCompany', () => {
    it('should match exact company names', () => {
      expect(fuzzyMatchCompany('Google', 'Google')).toBe(true);
    });

    it('should match with suffixes', () => {
      expect(fuzzyMatchCompany('Microsoft', 'Microsoft Inc.')).toBe(true);
      expect(fuzzyMatchCompany('Apple LLC', 'Apple')).toBe(true);
    });

    it('should match substring company names', () => {
      expect(fuzzyMatchCompany('Google', 'Google LLC')).toBe(true);
    });

    it('should not match completely different companies', () => {
      expect(fuzzyMatchCompany('Google', 'Microsoft')).toBe(false);
    });

    it('should match companies with shared significant words', () => {
      expect(fuzzyMatchCompany('Tesla Motors', 'Tesla Inc')).toBe(true);
    });
  });
});
