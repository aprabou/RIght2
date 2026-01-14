import { UserConnection } from '../types/connections';
import { normalizeCompanyName, normalizeJobTitle, connectionsStorage } from './connectionsStorage';

// Parse LinkedIn CSV export
export const parseLinkedInCSV = async (file: File): Promise<UserConnection[]> => {
  return new Promise((resolve, reject) => {
    // Validate file type
    if (!file.name.endsWith('.csv')) {
      reject(new Error('Please upload a valid CSV file'));
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      reject(new Error('File size exceeds 10MB limit'));
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        
        // Cache the raw CSV content
        connectionsStorage.cacheCSV(text);
        
        const connections = parseCSVText(text);
        resolve(connections);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsText(file);
  });
};

// Parse from cached CSV
export const parseFromCachedCSV = (): UserConnection[] => {
  const cachedCSV = connectionsStorage.getCachedCSV();
  if (!cachedCSV) {
    throw new Error('No cached CSV found');
  }
  return parseCSVText(cachedCSV);
};

// Parse CSV text content
const parseCSVText = (csvText: string): UserConnection[] => {
  const lines = csvText.split('\n').filter(line => line.trim());
  
  if (lines.length === 0) {
    throw new Error('CSV file is empty');
  }

  // Parse header
  const headers = parseCSVLine(lines[0]);
  
  // LinkedIn CSV format varies - check for different possible column names
  const findColumn = (possibleNames: string[]): string | null => {
    for (const name of possibleNames) {
      const found = headers.find(h => h.toLowerCase().trim() === name.toLowerCase().trim());
      if (found) return found;
    }
    return null;
  };

  const firstNameCol = findColumn(['First Name', 'first name', 'firstname']);
  const lastNameCol = findColumn(['Last Name', 'last name', 'lastname']);
  const companyCol = findColumn(['Company', 'company', 'organization']);
  const positionCol = findColumn(['Position', 'position', 'title', 'job title']);
  const connectedOnCol = findColumn(['Connected On', 'connected on', 'date']);
  const urlCol = findColumn(['URL', 'url', 'profile url', 'linkedin url']);

  // Debug logging
  console.log('📊 CSV Headers found:', headers);
  console.log('🔍 Column mappings:', {
    firstNameCol,
    lastNameCol,
    companyCol,
    positionCol,
    connectedOnCol,
    urlCol
  });

  // Validate required columns exist
  const missing: string[] = [];
  if (!firstNameCol) missing.push('First Name');
  if (!lastNameCol) missing.push('Last Name');
  if (!companyCol) missing.push('Company');
  if (!positionCol) missing.push('Position');
  
  if (missing.length > 0) {
    throw new Error(`Missing required columns: ${missing.join(', ')}. Found columns: ${headers.join(', ')}`);
  }

  // Parse data rows
  const connections: UserConnection[] = [];
  const now = new Date().toISOString();
  const userId = 'current_user'; // In a real app, this would be the actual user ID

  for (let i = 1; i < lines.length; i++) {
    try {
      const values = parseCSVLine(lines[i]);
      if (values.length < headers.length) continue; // Skip incomplete rows

      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });

      // Get values using the dynamically found column names
      const firstName = row[firstNameCol!] || '';
      const lastName = row[lastNameCol!] || '';
      const company = row[companyCol!] || '';
      const position = row[positionCol!] || '';
      const connectedOn = connectedOnCol ? row[connectedOnCol] : '';
      const profileUrl = urlCol ? (row[urlCol] || '').trim() : '';

      // Skip rows without company or name
      if (!firstName || !lastName || !company) {
        continue;
      }

      const fullName = `${firstName} ${lastName}`.trim();
      const companyTrimmed = company.trim();
      const title = position.trim();

      // Debug log first few connections
      if (i <= 3) {
        console.log(`🔗 Connection ${i}:`, {
          name: fullName,
          company: companyTrimmed,
          url: profileUrl,
          hasUrl: !!profileUrl
        });
      }      connections.push({
        id: generateConnectionId(fullName, companyTrimmed, title),
        user_id: userId,
        connection_name: fullName,
        company_name_raw: companyTrimmed,
        company_name_normalized: normalizeCompanyName(companyTrimmed),
        job_title_raw: title,
        job_title_normalized: normalizeJobTitle(title),
        connection_date: connectedOn,
        linkedin_url: profileUrl || undefined,
        source: 'linkedin_csv',
        last_updated_at: now
      });
    } catch (error) {
      console.warn(`Skipping row ${i + 1}:`, error);
      continue;
    }
  }

  // De-duplicate connections
  const uniqueConnections = deduplicateConnections(connections);

  if (uniqueConnections.length === 0) {
    throw new Error('No valid connections found in CSV');
  }

  // Debug summary
  const withUrls = uniqueConnections.filter(c => c.linkedin_url).length;
  console.log(`✅ Parsed ${uniqueConnections.length} connections (${withUrls} with LinkedIn URLs)`);

  return uniqueConnections;
};

// Parse a single CSV line (handles quoted values)
const parseCSVLine = (line: string): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++;
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  // Add last field
  result.push(current.trim());

  return result;
};

// Generate unique ID for connection
const generateConnectionId = (name: string, company: string, title: string): string => {
  const data = `${name}-${company}-${title}`.toLowerCase();
  // Simple hash function (in production, use a proper UUID library)
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `conn_${Math.abs(hash)}_${Date.now()}`;
};

// Remove duplicate connections
const deduplicateConnections = (connections: UserConnection[]): UserConnection[] => {
  const seen = new Set<string>();
  const unique: UserConnection[] = [];

  for (const connection of connections) {
    const key = `${connection.connection_name.toLowerCase()}-${connection.company_name_normalized}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(connection);
    }
  }

  return unique;
};

// Validate CSV file before parsing
export const validateCSVFile = (file: File): { valid: boolean; error?: string } => {
  if (!file.name.endsWith('.csv')) {
    return { valid: false, error: 'Please upload a valid CSV file' };
  }

  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return { valid: false, error: 'File size exceeds 10MB limit' };
  }

  if (file.size === 0) {
    return { valid: false, error: 'File is empty' };
  }

  return { valid: true };
};
