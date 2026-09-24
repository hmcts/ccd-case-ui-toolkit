import { Component } from '@angular/core';
import { of } from 'rxjs';
import { PaletteModule } from '../../projects/ccd-case-ui-toolkit/src/public-api';
import { CaseworkerService } from '../../projects/ccd-case-ui-toolkit/src/lib/shared/components/case-editor/services/case-worker.service';
import { OrganisationConverter } from '../../projects/ccd-case-ui-toolkit/src/lib/shared/domain/organisation/organisation-converter';
import { JurisdictionService } from '../../projects/ccd-case-ui-toolkit/src/lib/shared/services/jurisdiction/jurisdiction.service';
import { OrganisationService } from '../../projects/ccd-case-ui-toolkit/src/lib/shared/services/organisation/organisation.service';
import { referenceIdentityFields } from '../mocks/reference-identity.mock';

@Component({
  selector: 'toolkit-reference-identity-controls',
  imports: [PaletteModule],
  providers: [
    OrganisationConverter,
    { provide: OrganisationService, useValue: { getActiveOrganisations: () => of([{ organisationIdentifier: 'ORG-123', name: 'Reference Organisation', addressLine1: '1 Test Street', addressLine2: null, addressLine3: null, townCity: 'London', county: null, country: 'UK', postCode: 'SW1A 1AA' }]) } },
    { provide: CaseworkerService, useValue: { getUserByIdamId: (idamId: string) => idamId === 'staff-123' ? of({ firstName: 'Staff', lastName: 'Member' }) : of(null) } },
    { provide: JurisdictionService, useValue: {
      searchJudicialUsersByPersonalCodes: () => of([{ fullName: 'Judicial Reader', emailId: 'judicial@example.test' }]),
      getJudicialUserByIdamId: (idamId: string) => of(idamId === 'judicial-123' ? { fullName: 'Judicial Fallback' } : null)
    } }
  ],
  template: `
    <div data-testid="reference-identity-controls">
      <ccd-read-organisation-field [caseField]="fields.organisation" />
      <ccd-read-judicial-user-field [caseField]="fields.judicial" />
      <ccd-read-staff-user-field [caseField]="fields.staff" />
      <ccd-read-staff-user-field [caseField]="fields.staffJudicialFallback" />
    </div>
  `
})
export class ReferenceIdentityControlsComponent {
  readonly fields = referenceIdentityFields;
}
