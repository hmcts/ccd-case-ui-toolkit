import { Pipe, PipeTransform } from '@angular/core';
import { LinkedCasesService } from '../../components/palette/linked-cases/services';

@Pipe({
  name: 'ccdLinkCasesReasonValue'
})
export class LinkCasesReasonValuePipe implements PipeTransform {

  constructor(private readonly linkedCasesService: LinkedCasesService) {}

  public transform(reasonCode: string): any {
    const reasonCodeMapping = this.linkedCasesService.linkCaseReasons &&
                              this.linkedCasesService.linkCaseReasons.find(reason => reason.key === reasonCode);
    return reasonCodeMapping && reasonCodeMapping.value_en;
  }
}
