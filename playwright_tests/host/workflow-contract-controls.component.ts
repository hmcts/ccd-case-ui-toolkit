import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { PaletteModule } from '../../projects/ccd-case-ui-toolkit/src/public-api';
import { AbstractAppConfig } from '../../projects/ccd-case-ui-toolkit/src/lib/app.config';
import { AppMockConfig } from '../../projects/ccd-case-ui-toolkit/src/lib/app-config.mock';
import { CaseNotifier } from '../../projects/ccd-case-ui-toolkit/src/lib/shared/components/case-editor/services/case.notifier';
import { SessionStorageService } from '../../projects/ccd-case-ui-toolkit/src/lib/shared/services/session/session-storage.service';
import { CasesService } from '../../projects/ccd-case-ui-toolkit/src/lib/shared/components/case-editor/services/cases.service';
import { workflowLinkedCase, workflowLinkedLauncher, workflowQueryCase, workflowQueryLauncher } from '../mocks/workflow-contract.mock';

@Component({
  selector: 'toolkit-workflow-contract-controls',
  imports: [PaletteModule],
  providers: [
    { provide: CasesService, useValue: { getLinkedCases: () => new URLSearchParams(window.location.search).has('linked-error')
      ? throwError(() => ({ status: 503 })) : of({ linkedCases: [] }) } },
    { provide: ActivatedRoute, useValue: { snapshot: { params: { cid: '1111222233334444' }, data: { case: new URLSearchParams(window.location.search).has('workflow-linked') ? workflowLinkedCase : workflowQueryCase } } } },
    { provide: CaseNotifier, useValue: { caseView: of(workflowQueryCase), fetchAndRefresh: () => of(workflowQueryCase) } },
    { provide: SessionStorageService, useValue: { getItem: () => JSON.stringify({ roles: ['pui-case-manager'] }) } },
    { provide: AbstractAppConfig, useFactory: () => Object.assign(new AppMockConfig(), {
      getEnableServiceSpecificMultiFollowups: () => new URLSearchParams(window.location.search).has('multi-followup') ? ['TEST'] : []
    }) }
  ],
  template: `
    <section data-testid="workflow-query"><ccd-field-read [caseField]="launcher" [caseReference]="'1111222233334444'" /></section>
  `
})
export class WorkflowContractControlsComponent {
  readonly launcher = new URLSearchParams(window.location.search).has('workflow-linked') ? workflowLinkedLauncher : workflowQueryLauncher;
}
