import { Injectable } from '@angular/core';

@Injectable()
export class YesNoService {
  private static readonly YES_INPUTS = new Set([
    'Y',
    'YES'
  ]);
  private static readonly NO_INPUTS = new Set([
    'N',
    'NO'
  ]);
  private static readonly YES = 'Yes';
  private static readonly NO = 'No';
  private static readonly EMPTY = null;

  public format(value: any): string {

    if (this.isYes(value)) {
      return YesNoService.YES;
    } else if (this.isNo(value)) {
      return YesNoService.NO;
    }

    return YesNoService.EMPTY;
  }

  private isYes(value: any): boolean {
    // tslint:disable-next-line:switch-default
    switch (typeof(value)) {
      case 'boolean':
        return value;
      case 'string':
        return YesNoService.YES_INPUTS.has(value.toUpperCase());
    }

    return false;
  }

  private isNo(value: any): boolean {
    // tslint:disable-next-line:switch-default
    switch (typeof(value)) {
      case 'boolean':
        return !value;
      case 'string':
        return YesNoService.NO_INPUTS.has(value.toUpperCase());
    }

    return false;
  }
}
