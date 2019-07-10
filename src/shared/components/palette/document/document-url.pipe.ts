import { Pipe, PipeTransform } from '@angular/core';
import { AbstractAppConfig } from '../../../../app.config';

@Pipe({
  name: 'ccdDocumentUrl'
})
export class DocumentUrlPipe implements PipeTransform {

  constructor(private appConfig: AbstractAppConfig) {}

  transform(value: string): string {
    /* The below hardcoded URLs needs to be injected via appConfig:
          this.appConfig.getRemoteDocumentManagementUrl()
          this.appConfig.getDocumentManagementUrl() */
    let remoteDocumentManagementPattern = new RegExp('http://dm-store:8080/documents');
    return value.replace(remoteDocumentManagementPattern, 'http://localhost:3453/documents');
  }
}
