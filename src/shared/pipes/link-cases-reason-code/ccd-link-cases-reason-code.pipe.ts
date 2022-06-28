import { Pipe, PipeTransform } from '@angular/core';
import { LinkedCasesService } from '../../components/palette/case-link/services';

@Pipe({
  name: 'ccdLinkCasesReasonValue'
})

export class LinkCasesReasonValuePipe implements PipeTransform {
  constructor(private linkedCasesService: LinkedCasesService) {}
  transform(reasonCode: string): any {
    const reasonCodeMapping = this.linkedCasesService.linkCaseReasons &&
                              this.linkedCasesService.linkCaseReasons.find(reason => reason.key === reasonCode);
    return reasonCodeMapping && reasonCodeMapping.value_en;
  }
}
