import { AlertLevel } from './alert-level.model';

export interface AlertStatusParams {
  phrase: string;
  replacements?: Record<string, string>;
  preserve?: boolean;
}
