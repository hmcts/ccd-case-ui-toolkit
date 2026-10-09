import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { PaletteModule } from '../../projects/ccd-case-ui-toolkit/src/public-api';
import { CaseFlagRefdataService } from '../../projects/ccd-case-ui-toolkit/src/lib/shared/services';
import { CaseFlagDisplayContextParameter } from '../../projects/ccd-case-ui-toolkit/src/lib/shared/components/palette/case-flag/enums';
import { flagWriterSelection, flagWriterTypes } from '../mocks/flag-writer.mock';

@Component({
  selector: 'toolkit-flag-writer',
  imports: [CommonModule, PaletteModule],
  providers: [{ provide: CaseFlagRefdataService, useValue: {
    getCaseFlagsRefdata: () => new URLSearchParams(window.location.search).has('flags-unavailable')
      ? throwError(() => new Error('Flag reference data unavailable')) : of(structuredClone(flagWriterTypes))
  } }],
  template: `
    <section data-testid="flag-writer">
      <ng-container *ngIf="create; else update">
        <ccd-select-flag-type #selector [formGroup]="form" hmctsServiceId="TEST"
          [isDisplayContextParameterExternal]="external" [isDisplayContextParameter2Point1Enabled]="true"
          (caseFlagStateEmitter)="receive($event)" />
        <button type="button" *ngIf="!selector.refdataError" (click)="selector.next()">Continue flag selection</button>
      </ng-container>
      <ng-template #update>
        <ccd-update-flag #editor [formGroup]="form" [displayContextParameter]="context"
          (caseFlagStateEmitter)="receive($event)" />
        <button type="button" (click)="editor.next()">Validate flag update</button>
      </ng-template>
      <output data-testid="flag-writer-value">{{ form.value | json }}</output>
      <output data-testid="flag-writer-event">{{ state | json }}</output>
    </section>
  `
})
export class FlagWriterControlsComponent {
  readonly create = new URLSearchParams(window.location.search).get('flags-write') === 'create';
  readonly external = new URLSearchParams(window.location.search).has('external-user');
  readonly context = this.external ? CaseFlagDisplayContextParameter.UPDATE_EXTERNAL : CaseFlagDisplayContextParameter.UPDATE_2_POINT_1;
  readonly form = new FormGroup({ selectedManageCaseLocation: new FormControl(structuredClone(flagWriterSelection)) });
  state: unknown = null;
  receive(state: unknown): void {
    // Reference-data errors can be emitted during the child's initial lifecycle.
    queueMicrotask(() => this.state = state);
  }
}
