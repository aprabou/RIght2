import { JobConnectionMatch } from '../utils/connectionMatcher';
import { LoadingStatus } from './enums';

export interface Contact {
  name: string;
  title: string;
  reason: string;
}

export interface Job {
  id?: string;
  company: string;
  role: string;
  location: string;
  contact: Contact;
  url?: string;
  date_posted: Date | null;
  date_updated: Date | null;
  category?: string;
  connectionCount: number;
  connectionMatches: JobConnectionMatch[];
}

/**
 * Discriminated union for loading states
 */
export type LoadingState<T> =
  | { status: LoadingStatus.IDLE }
  | { status: LoadingStatus.LOADING }
  | { status: LoadingStatus.SUCCESS; data: T }
  | { status: LoadingStatus.ERROR; error: Error };
