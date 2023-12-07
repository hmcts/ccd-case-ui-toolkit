import { Injectable } from '@angular/core';

@Injectable()
export class Constants {
  public static readonly MANDATORY: string = 'MANDATORY';
  public static readonly REGEX_WHITESPACES: string = '^[^ ]+(?:\\s+[^ ]+)*$';
}
