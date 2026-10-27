import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { of, throwError } from 'rxjs';
import { PaletteModule } from '../../projects/ccd-case-ui-toolkit/src/public-api';
import { SearchService } from '../../projects/ccd-case-ui-toolkit/src/lib/shared/services';
import { CasesService } from '../../projects/ccd-case-ui-toolkit/src/lib/shared/components/case-editor/services/cases.service';
import { LinkedCasesService } from '../../projects/ccd-case-ui-toolkit/src/lib/shared/components/palette/linked-cases/services';
import { JurisdictionService } from '../../projects/ccd-case-ui-toolkit/src/lib/shared/services/jurisdiction/jurisdiction.service';
import { linkedWriterCase, linkedWriterReasons } from '../mocks/linked-writer.mock';

@Component({
  selector: 'toolkit-linked-case-writer',
  imports: [CommonModule, PaletteModule],
  providers: [
    LinkedCasesService,
    { provide: SearchService, useValue: {} },
    { provide: JurisdictionService, useValue: { getJurisdictions: () => of([]) } },
    { provide: CasesService, useValue: { getCaseViewV2: (reference: string) => reference === linkedWriterCase.case_id
      ? of(linkedWriterCase) : throwError(() => ({ status: 404 })) } }
  ],
  template: `
    <section data-testid="linked-case-writer">
      <ccd-link-cases *ngIf="!unlink; else unlinkStage" (linkedCasesStateEmitter)="state = $event" />
      <output data-testid="linked-case-event">{{ state | json }}</output>
      <ng-template #unlinkStage>
        <ccd-unlink-cases #unlinker (linkedCasesStateEmitter)="state = $event" />
        <button type="button" (click)="unlinker.next()">Continue unlink</button>
        <output data-testid="unlink-event">{{ state | json }}</output>
        <output data-testid="unlink-references">{{ service.casesToUnlink | json }}</output>
      </ng-template>
      <output data-testid="linked-case-payload">{{ service.caseFieldValue | json }}</output>
    </section>
  `
})
export class LinkedCaseWriterControlsComponent {
  readonly unlink = new URLSearchParams(window.location.search).get('linked-write') === 'unlink';
  state: unknown = null;
  constructor(public readonly service: LinkedCasesService) {
    service.caseId = '1111222233334444';
    service.caseName = 'Current case';
    service.linkCaseReasons = structuredClone(linkedWriterReasons);
    if (this.unlink) {
      service.linkedCases = [{ caseReference: linkedWriterCase.case_id, caseName: 'Related evidence case', reasons: [],
        createdDateTime: '2025-01-01T00:00:00.000', caseType: 'TestCase', caseTypeDescription: 'Test case', caseStateDescription: 'Open', caseState: 'Open', caseService: 'Test service', unlink: false }];
    }
  }
}
