import { Injectable } from '@angular/core';
import { WindowService } from '../../services/window';

const DETAILED_DEBUG_LOGS_ENABLED = 'detailed-debug-logs-enabled';

@Injectable()
export class LogService {

  detailedLogsEnabled: boolean = false;

  constructor(private windowService: WindowService) {
    let logsEnabled = this.windowService.getLocalStorage(DETAILED_DEBUG_LOGS_ENABLED);

    if (logsEnabled) {
      this.detailedLogsEnabled = JSON.parse(logsEnabled);
    }
  }

  log(msg: any) {
    if (this.detailedLogsEnabled) {
      console.log(msg);
    }
  }

}
