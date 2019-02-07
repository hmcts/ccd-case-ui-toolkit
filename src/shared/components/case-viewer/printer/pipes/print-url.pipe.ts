import { Pipe, PipeTransform } from '@angular/core';
import { AbstractAppConfig } from '../../../../../app.config';

@Pipe({
  name: 'ccdPrintUrl'
})
export class PrintUrlPipe implements PipeTransform {

  constructor(private appConfig: AbstractAppConfig) {}

  transform(value: string): string {
    return value.replace(this.appConfig.getRemotePrintServiceUrl(), this.appConfig.getPrintServiceUrl());
  }
}
