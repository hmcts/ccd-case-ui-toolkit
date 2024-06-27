import { Injectable } from '@angular/core';

@Injectable()
export class Constants {
  public static readonly MANDATORY: string = 'MANDATORY';
  public static readonly REGEX_WHITESPACES: string = '^[^ ]+(?:\\s+[^ ]+)*$';
  public static readonly TASK_COMPLETION_ERROR = 'The associated task for this event failed to complete automatically. Please complete the task manually in the Tasks tab on the case';
}
