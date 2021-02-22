import { Injectable } from '@angular/core';
import { AbstractAppConfig } from '../../../app.config';
import { WindowService } from '../../services/window';

export enum LogLevel {
  Debug = 1,
  Info = 2,
  Warn = 3,
  Error = 4,
  Fatal = 5,
  Off = 6
}

const ALL_CASE_FIELD_LIST = 'All';
const DETAILED_DEBUG_LOGS_ENABLED = 'detailed-debug-logs-enabled';

@Injectable()
export class LogService {

  logLevel: LogLevel = LogLevel.Off;
  loggingCaseFieldList: string[] = [];
  detailedLogsEnabled: boolean = false;

  constructor(private appConfig: AbstractAppConfig, private windowService: WindowService) {
    let caseFieldList = appConfig.getLoggingCaseFieldList();
    if (caseFieldList && caseFieldList.trim().length > 0) {
      this.loggingCaseFieldList = caseFieldList.split(',');
    }

    let level = appConfig.getLoggingLevel();
    if (level) {
      this.logLevel = LogLevel[level];
    }

    let logsEnabled = this.windowService.getLocalStorage(DETAILED_DEBUG_LOGS_ENABLED);
    if (logsEnabled) {
      this.detailedLogsEnabled = JSON.parse(logsEnabled);
    }
  }

  debug(caseFieldId: string, msg: any) {
    this.writeToLog(LogLevel.Debug, caseFieldId, msg);
  }

  info(caseFieldId: string, msg: any) {
    this.writeToLog(LogLevel.Info, caseFieldId, msg);
  }

  warn(caseFieldId: string, msg: any) {
    this.writeToLog(LogLevel.Warn, caseFieldId, msg);
  }

  error(caseFieldId: string, msg: any) {
    this.writeToLog(LogLevel.Error, caseFieldId, msg);
  }

  fatal(caseFieldId: string, msg: any) {
    this.writeToLog(LogLevel.Fatal, caseFieldId, msg);
  }

  private writeToLog(level: LogLevel, caseFieldId: string, msg: any) {
    if (this.shouldLog(level, caseFieldId)) {
      console.log(msg);
    }
  }

  private shouldLog(level: LogLevel, caseFieldId: string): boolean {
    let isValidCaseField: boolean = false;

    if (ALL_CASE_FIELD_LIST === caseFieldId) {
      isValidCaseField = true;
    } else {
      for (var index in this.loggingCaseFieldList) {
        if (caseFieldId === this.loggingCaseFieldList[index].trim()) {
          isValidCaseField = true;
        }
      }
    }

    return this.detailedLogsEnabled || (isValidCaseField && level >= this.logLevel) ;
  }

}
