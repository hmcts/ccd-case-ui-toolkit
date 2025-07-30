import { Pipe, PipeTransform } from '@angular/core';
import { LinkReason } from '../../components';
import { LinkedCasesService } from '../../components/palette/linked-cases/services';

@Pipe({
  name: 'ccdLinkCasesReasonValue',
  standalone: false
})
export class LinkCasesReasonValuePipe implements PipeTransform {
  constructor(private readonly linkedCasesService: LinkedCasesService) {}

  public transform(linkReason: string | LinkReason): string {
    if (typeof linkReason === 'string') {
      return this.linkedCasesService.linkCaseReasons?.find((reason) => reason.key === linkReason)?.value_en || linkReason;
    }

    // original logic
    if (linkReason?.OtherDescription) {
      const reasonCodeMapping = this.linkedCasesService.linkCaseReasons?.find((reason) => reason.key === linkReason.Reason);
      return reasonCodeMapping?.value_en === 'Other'
        ? `${reasonCodeMapping?.value_en} - ${linkReason.OtherDescription}`
        : reasonCodeMapping?.value_en;
    }

    return this.linkedCasesService.linkCaseReasons?.find((reason) => reason.key === linkReason.Reason)?.value_en;
  }
}
