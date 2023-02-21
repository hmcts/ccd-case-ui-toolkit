import { Pipe, PipeTransform } from '@angular/core';
import { LinkFromReason } from '../../components/palette/linked-cases/domain';
import { LinkedCasesService } from '../../components/palette/linked-cases/services';

@Pipe({
  name: 'ccdLinkCasesFromReasonValue'
})
export class LinkCasesFromReasonValuePipe implements PipeTransform {

  constructor(private readonly linkedCasesService: LinkedCasesService) {}

  public transform(linkFromReason: LinkFromReason): string {
    if (linkFromReason?.otherDescription) {
      const reasonCodeMapping = this.linkedCasesService.linkCaseReasons?.find(reason => reason.key === linkFromReason.reasonCode);
      return reasonCodeMapping?.value_en === 'Other'
        ? `${reasonCodeMapping?.value_en} - ${linkFromReason.otherDescription}`
        : reasonCodeMapping?.value_en;
    }
    return this.linkedCasesService.linkCaseReasons?.find(reason => reason.key === linkFromReason.reasonCode)?.value_en;
  }
}
