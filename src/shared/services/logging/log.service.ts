import { Injectable } from '@angular/core';
import { AbstractAppConfig } from '../../../app.config';

export enum LogLevel {
  Debug = 1,
  Info = 2,
  Warn = 3,
  Error = 4,
  Fatal = 5,
  Off = 6
}

@Injectable()
export class LogService {
  level: LogLevel = LogLevel.Debug;
  caseFieldIdList: string[];

  constructor(private config: AbstractAppConfig) {
    caseFieldIdList = config.getCaseFieldIdList();
  }

  debug(caseFieldId: string, msg: string) {
    this.writeToLog(LogLevel.Debug, caseFieldId, msg);
  }

  info(caseFieldId: string, msg: string) {
    this.writeToLog(LogLevel.Info, caseFieldId, msg);
  }

  warn(caseFieldId: string, msg: string) {
    this.writeToLog(LogLevel.Warn, caseFieldId, msg);
  }

  error(caseFieldId: string, msg: string) {
    this.writeToLog(LogLevel.Error, caseFieldId, msg);
  }

  fatal(caseFieldId: string, msg: string) {
    this.writeToLog(LogLevel.Fatal, caseFieldId, msg);
  }

  private writeToLog(level: LogLevel, caseFieldId: string, msg: string) {
    if (this.shouldLog(level, caseFieldId)) {
      console.log(msg);
    }
  }

  private shouldLog(level: LogLevel, caseFieldId: string): boolean {
    let isValidCaseField: boolean = false;

    if ('ANY' === caseFieldId) {
      isValidCaseField = true;
    } else {
      for (var index in this.caseFieldIdList) {
        if (caseFieldId === this.caseFieldIdList[index]) {
          isValidCaseField = true;
        }
      }
    }

    return isValidCaseField && level >= this.level;
  }

}
