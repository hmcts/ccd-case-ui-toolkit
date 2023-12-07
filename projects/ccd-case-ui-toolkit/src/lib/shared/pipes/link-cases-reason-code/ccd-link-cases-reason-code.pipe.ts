import { Pipe, PipeTransform } from '@angular/core';
import { LinkReason } from '../../components';
import { LinkedCasesService } from '../../components/palette/linked-cases/services';

@Pipe({
  name: 'ccdLinkCasesReasonValue'
})
export class LinkCasesReasonValuePipe implements PipeTransform {

  constructor(private readonly linkedCasesService: LinkedCasesService) {}

  public transform(linkReason: LinkReason): string {
		if (linkReason?.OtherDescription) {
			const reasonCodeMapping = this.linkedCasesService.linkCaseReasons?.find(reason => reason.key === linkReason.Reason);
			return reasonCodeMapping?.value_en === 'Other'
				? `${reasonCodeMapping?.value_en} - ${linkReason.OtherDescription}`
				: reasonCodeMapping?.value_en;
		}
    return this.linkedCasesService.linkCaseReasons?.find(reason => reason.key === linkReason.Reason)?.value_en;
  }
}
