import { Injectable } from '@angular/core';

@Injectable()
export class Constants {
  static readonly MANDATORY: string = 'MANDATORY';
  static readonly REGEX_WHITESPACES: string = '^[^ ]+(?:\\s+[^ ]+)*$';
}
