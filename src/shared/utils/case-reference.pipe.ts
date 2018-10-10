import { Pipe, PipeTransform } from '@angular/core';
import { Draft, DRAFT_PREFIX } from '../domain/draft';

@Pipe({
  name: 'ccdCaseReference'
})
export class CaseReferencePipe implements PipeTransform {

  transform(caseReference: string): string {
    if (Draft.isDraft(caseReference)) {
      return DRAFT_PREFIX;
    } else {
      return String(caseReference).replace(/(\d{4})(\d{4})(\d{4})(\d{4})/, '$1-$2-$3-$4');
    }
  }
}
