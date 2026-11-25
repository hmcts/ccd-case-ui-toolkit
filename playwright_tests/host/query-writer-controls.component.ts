import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { PaletteModule } from '../../projects/ccd-case-ui-toolkit/src/public-api';
import { CaseNotifier } from '../../projects/ccd-case-ui-toolkit/src/lib/shared/components/case-editor/services/case.notifier';
import { QueryCreateContext, QueryListData } from '../../projects/ccd-case-ui-toolkit/src/lib/shared/components/palette/query-management/models';
import { QueryManagementService } from '../../projects/ccd-case-ui-toolkit/src/lib/shared/components/palette/query-management/services';
import { SessionStorageService } from '../../projects/ccd-case-ui-toolkit/src/lib/shared/services/session/session-storage.service';
import { queryWriterCollection, queryWriterEvent } from '../mocks/query-writer.mock';
import { launcherRouteCase } from '../mocks/launchers.mock';

@Component({
  selector: 'toolkit-query-writer-controls',
  imports: [CommonModule, PaletteModule],
  providers: [
    QueryManagementService,
    { provide: ActivatedRoute, useValue: { snapshot: { params: {
      cid: '1111222233334444', dataid: 'writer-query',
      qid: new URLSearchParams(window.location.search).get('query-write') === 'followup' ? '4' : '3'
    } } } },
    { provide: CaseNotifier, useValue: { caseView: of(launcherRouteCase), fetchAndRefresh: () => of(launcherRouteCase) } },
    { provide: SessionStorageService, useValue: { getItem: () => JSON.stringify({
      uid: 'writer-user', name: 'Test Writer', roles: new URLSearchParams(window.location.search).has('external-user')
        ? ['pui-case-manager'] : ['caseworker-test']
    }) } }
  ],
  template: `
    <section data-testid="query-writer">
      <ccd-query-write-raise-query *ngIf="context === contexts.NEW_QUERY"
        [formGroup]="form" [showForm]="true" [submitted]="submitted" [eventData]="event" serviceMessage="Query details"
        [queryCreateContext]="context" [triggerSubmission]="trigger" (queryDataCreated)="receive($event)" />
      <ccd-query-write-respond-to-query *ngIf="context !== contexts.NEW_QUERY"
        [formGroup]="form" [showForm]="true" [submitted]="submitted" [eventData]="event"
        [caseQueriesCollections]="collections" [queryItem]="query" [queryCreateContext]="context"
        [triggerSubmission]="trigger" (queryDataCreated)="receive($event)" />
      <button type="button" (click)="submit()">Emit query data</button>
      <output data-testid="query-writer-payload">{{ payload | json }}</output>
    </section>
  `
})
export class QueryWriterControlsComponent {
  readonly contexts = QueryCreateContext;
  readonly mode = new URLSearchParams(window.location.search).get('query-write');
  readonly context = this.mode === 'raise' ? QueryCreateContext.NEW_QUERY
    : this.mode === 'followup' ? QueryCreateContext.FOLLOWUP : QueryCreateContext.RESPOND;

  readonly event = structuredClone(queryWriterEvent);
  readonly collections = [structuredClone(queryWriterCollection)];
  readonly query = new QueryListData(this.collections[0]).queries[0];
  readonly form = new FormGroup({
    subject: new FormControl('', this.context === QueryCreateContext.NEW_QUERY ? Validators.required : []),
    body: new FormControl('', Validators.required),
    isHearingRelated: new FormControl(false), hearingDate: new FormControl(null),
    attachments: new FormControl([]), closeQuery: new FormControl(false)
  });

  submitted = false;
  trigger = false;
  payload: unknown = null;
  receive(payload: unknown): void {
    // The public output is emitted during the child input lifecycle. Render after that check completes.
    queueMicrotask(() => this.payload = payload);
  }

  submit(): void {
    this.submitted = true;
    this.trigger = this.form.valid;
  }
}
