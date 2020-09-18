import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReadOrganisationFieldTableComponent } from './read-organisation-field-table.component';
import { MarkdownModule } from '../../markdown';
import { ReactiveFormsModule } from '@angular/forms';
import { ConditionalShowModule } from '../../../directives/conditional-show';
import { CommonModule } from '@angular/common';
import { FieldsFilterPipe } from '../complex';
import { PaletteUtilsModule } from '../utils';
import { CaseField, FieldType } from '../../../domain/definition';
import { PaletteService } from '../palette.service';
import { MockComponent } from 'ng2-mock-component';
import { OrganisationService } from '../../../services/organisation';
import { OrganisationConverter } from '../../../domain/organisation';
import { of } from 'rxjs';

describe('ReadOrganisationFieldTableComponent', () => {
  let component: ReadOrganisationFieldTableComponent;
  let fixture: ComponentFixture<ReadOrganisationFieldTableComponent>;
  let FieldReadComponent = MockComponent({
    selector: 'ccd-field-read',
    inputs: ['caseField', 'context']
  });
  const mockOrganisationService = jasmine.createSpyObj<OrganisationService>('OrganisationService', ['getActiveOrganisations']);
  const FIELD_TYPE_WITH_VALUES: FieldType = {
    id: 'Organisation',
    type: 'Complex',
    complex_fields: [
      <CaseField>({
        id: 'OrganisationID',
        label: 'Organisation ID',
        display_context: 'MANDATORY',
        field_type: {
          id: 'Text',
          type: 'Text'
        },
        value: 'O111111'
      }),
      <CaseField>({
        id: 'OrganisationName',
        label: 'Organisation Name',
        display_context: 'MANDATORY',
        field_type: {
          id: 'Text',
          type: 'Text'
        },
        value: 'Test organisation name'
      })
    ]
  };
  const CASE_FIELD: CaseField = <CaseField>({
    id: 'respondentOrganisation',
    label: 'Complex Field',
    display_context: 'OPTIONAL',
    field_type: FIELD_TYPE_WITH_VALUES
  });
  const ORGANISATIONS = [{
    organisationIdentifier: 'O111111',
    name: 'Woodford solicitor',
    addressLine1: '12',
    addressLine2: 'Nithdale Role',
    addressLine3: '',
    townCity: 'Liverpool',
    county: 'Merseyside',
    country: 'UK',
    postCode: 'L15 5AX'
  }, {
    organisationIdentifier: 'O222222',
    name: 'Broker solicitor',
    addressLine1: '33',
    addressLine2: 'The square',
    addressLine3: '',
    townCity: 'Swindon',
    county: 'Wiltshire',
    country: 'UK',
    postCode: 'SN1 3EB'
  }, {
    organisationIdentifier: 'O333333',
    name: 'The Ethical solicitor',
    addressLine1: 'Davidson House',
    addressLine2: '33',
    addressLine3: 'The square',
    townCity: 'Reading',
    county: 'Berkshire',
    country: 'UK',
    postCode: 'RG11EB'
  }, {
    organisationIdentifier: 'O444444',
    name: 'The SN1 solicitor',
    addressLine1: 'Davidson House',
    addressLine2: '44',
    addressLine3: 'The square',
    townCity: 'Reading',
    county: 'Berkshire',
    country: 'UK',
    postCode: 'RG11EX'
  }];

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        ConditionalShowModule,
        CommonModule,
        ReactiveFormsModule,
        MarkdownModule,
        PaletteUtilsModule
      ],
      declarations: [
        ReadOrganisationFieldTableComponent,
        FieldsFilterPipe,
        FieldReadComponent
      ],
      providers: [
        PaletteService,
        { provide: OrganisationService, useValue: mockOrganisationService },
        OrganisationConverter
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReadOrganisationFieldTableComponent);
    component = fixture.componentInstance;
    component.caseField = CASE_FIELD;
    component.caseFields = [CASE_FIELD];
    mockOrganisationService.getActiveOrganisations.and.returnValue(of(ORGANISATIONS));
    component.caseField = new CaseField();
    component.caseField.value = {'OrganisationID': 'O333333', 'OrganisationName': 'The Ethical solicitor'};
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should read selected organisation', () => {
    component.selectedOrg$.toPromise().then(
      selectedOrg => {
        expect(selectedOrg.organisationIdentifier).toEqual('O333333');
        expect(selectedOrg.name).toEqual('The Ethical solicitor');
        expect(selectedOrg.address).toEqual('Davidson House<br>33<br>The square<br>Reading<br>Berkshire<br>UK<br>RG11EB<br>');
      }
    )
  });
});
