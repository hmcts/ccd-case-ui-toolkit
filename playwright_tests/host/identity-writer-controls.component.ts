import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { CaseNotifier, PaletteModule } from '../../projects/ccd-case-ui-toolkit/src/public-api';
import { CaseworkerService } from '../../projects/ccd-case-ui-toolkit/src/lib/shared/components/case-editor/services/case-worker.service';
import { OrganisationConverter } from '../../projects/ccd-case-ui-toolkit/src/lib/shared/domain/organisation/organisation-converter';
import { CaseFlagRefdataService } from '../../projects/ccd-case-ui-toolkit/src/lib/shared/services/case-flag/case-flag-refdata.service';
import { JurisdictionService } from '../../projects/ccd-case-ui-toolkit/src/lib/shared/services/jurisdiction/jurisdiction.service';
import { WindowService } from '../../projects/ccd-case-ui-toolkit/src/lib/shared/services/window/window.service';
import { OrganisationService } from '../../projects/ccd-case-ui-toolkit/src/lib/shared/services/organisation/organisation.service';
import { identityWriterFields, identityWriterJudges, identityWriterOrganisations, identityWriterStaff } from '../mocks/identity-writer.mock';

@Component({
  selector: 'toolkit-identity-writer-controls',
  imports: [CommonModule, PaletteModule],
  providers: [
    OrganisationConverter,
    WindowService,
    { provide: OrganisationService, useValue: { getActiveOrganisations: () => of(new URLSearchParams(window.location.search).get('identity-org') === 'unavailable' ? [] : identityWriterOrganisations) } },
    { provide: CaseNotifier, useValue: { caseView: of(null) } },
    { provide: JurisdictionService, useValue: {
      getSelectedJurisdiction: () => new BehaviorSubject({ id: 'TEST', currentCaseType: { id: 'TestCase-test' } }),
      searchJudicialUsers: (term: string) => term === 'failure' ? throwError(() => new Error('Reference lookup unavailable')) : of(term.toLowerCase().startsWith('alex') ? identityWriterJudges : [])
    } },
    { provide: CaseFlagRefdataService, useValue: {
      getHmctsServiceDetailsByCaseType: () => of([{ service_code: 'TEST', ccd_service_name: 'Test service' }])
    } },
    { provide: CaseworkerService, useValue: {
      searchStaffUsers: (_services: string[], term: string) => term === 'failure' ? throwError(() => new Error('Reference lookup unavailable')) : of(term.toLowerCase().startsWith('alex') ? identityWriterStaff : [])
    } }
  ],
  template: `
    <section data-testid="identity-writer-controls">
      <ccd-write-case-link-field [caseField]="fields.caseLink" [formGroup]="linkForm" />
      <output data-testid="identity-link-payload">{{ linkForm.value | json }}</output>
      <output data-testid="identity-link-valid">{{ linkForm.valid }}</output>
      <ccd-write-organisation-field [caseField]="fields.organisation" [formGroup]="organisationForm" />
      <output data-testid="identity-org-payload">{{ organisationForm.value | json }}</output>
      <ccd-write-judicial-user-field [caseField]="fields.judicial" [formGroup]="judicialForm" />
      <output data-testid="identity-judge-payload">{{ judicialForm.get('writer-judge')?.value | json }}</output>
      <output data-testid="identity-judge-valid">{{ judicialForm.valid }}</output>
      <ccd-write-staff-user-field [caseField]="fields.staff" [formGroup]="staffForm" />
      <output data-testid="identity-staff-payload">{{ staffForm.get('writer-staff')?.value | json }}</output>
      <output data-testid="identity-staff-valid">{{ staffForm.valid }}</output>
      <button type="button">Leave identity field</button>
    </section>
  `
})
export class IdentityWriterControlsComponent implements AfterViewInit {
  constructor(private readonly changeDetector: ChangeDetectorRef) {}

  public ngAfterViewInit(): void {
    // Child writers register controls during view creation; render their final initial validity.
    this.changeDetector.detectChanges();
  }

  readonly fields = identityWriterFields;
  readonly linkForm = new FormGroup({});
  readonly organisationForm = new FormGroup({});
  readonly judicialForm = new FormGroup({});
  readonly staffForm = new FormGroup({});
}
