import { Pipe, PipeTransform } from '@angular/core';
import { Draft } from '../domain/draft';

@Pipe({
  name: 'ccdCaseReference'
})
export class CaseReferencePipe implements PipeTransform {

  transform(caseReference: string): string {
    if (Draft.isDraft(caseReference)) {
      return Draft.DRAFT;
    } else {
      return String(caseReference).replace(/(\d{4})(\d{4})(\d{4})(\d{4})/, '$1-$2-$3-$4');
    }
  }
}
