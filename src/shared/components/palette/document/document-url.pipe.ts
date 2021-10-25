import { Pipe, PipeTransform } from '@angular/core';
import { AbstractAppConfig } from '../../../../app.config';

@Pipe({
  name: 'ccdDocumentUrl'
})
export class DocumentUrlPipe implements PipeTransform {

  constructor(private appConfig: AbstractAppConfig) {}

  transform(value: string): string {
    let remoteHrsPattern = new RegExp(this.appConfig.getRemoteHrsUrl());
    value = value.replace(remoteHrsPattern, this.appConfig.getHrsUrl());
    let remoteDocumentManagementPattern = new RegExp(this.appConfig.getRemoteDocumentManagementUrl());
    return value.replace(remoteDocumentManagementPattern, this.appConfig.getDocumentManagementUrl());
  }
}
