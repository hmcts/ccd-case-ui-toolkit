import { Pipe, PipeTransform } from '@angular/core';
import { AppConfig } from '../../app.config';

@Pipe({
  name: 'ccdDocumentUrl'
})
export class DocumentUrlPipe implements PipeTransform {

  constructor(private appConfig: AppConfig) {}

  transform(value: string): string {
    let remoteDocumentManagementPattern = new RegExp(this.appConfig.getRemoteDocumentManagementUrl());
    return value.replace(remoteDocumentManagementPattern, this.appConfig.getDocumentManagementUrl());
  }
}
