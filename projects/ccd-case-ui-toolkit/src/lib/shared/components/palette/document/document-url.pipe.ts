import { Pipe, PipeTransform } from '@angular/core';
import { AbstractAppConfig } from '../../../../app.config';

@Pipe({
  name: 'ccdDocumentUrl'
})
export class DocumentUrlPipe implements PipeTransform {

  constructor(private readonly appConfig: AbstractAppConfig) {}

  public transform(value: string): string {
    const remoteHrsPattern = new RegExp(this.appConfig.getRemoteHrsUrl());
    value = value.replace(remoteHrsPattern, this.appConfig.getHrsUrl());
    const remoteDocumentManagementPattern = new RegExp(this.appConfig.getRemoteDocumentManagementUrl());
    return value.replace(remoteDocumentManagementPattern, this.appConfig.getDocumentManagementUrl());
  }
}
