import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CommonModule } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MockComponent } from 'ng2-mock-component';
import { of } from 'rxjs';
import { ConditionalShowModule } from '../../../directives/conditional-show';
import { CaseField, FieldType } from '../../../domain/definition';
import { OrganisationConverter } from '../../../domain/organisation';
import { CaseReferencePipe } from '../../../pipes/case-reference/case-reference.pipe';
import { FieldsFilterPipe } from '../../../pipes/complex/fields-filter.pipe';
import { OrganisationService } from '../../../services/organisation';
import { MockRpxTranslatePipe } from '../../../test/mock-rpx-translate.pipe';
import { ConvertHrefToRouterService } from '../../case-editor/services';
import { MarkdownComponent } from '../markdown/markdown.component';
import { PaletteService } from '../palette.service';
import { PaletteUtilsModule } from '../utils';
import { ReadOrganisationFieldTableComponent } from './read-organisation-field-table.component';

describe('ReadOrganisationFieldTableComponent', () => {
  let component: ReadOrganisationFieldTableComponent;
  let fixture: ComponentFixture<ReadOrganisationFieldTableComponent>;
  const fieldReadComponentMock = MockComponent({
    selector: 'ccd-field-read',
    inputs: ['caseField', 'context']
  });
  const mockOrganisationService = jasmine.createSpyObj<OrganisationService>('OrganisationService', ['getActiveOrganisations']);
  const FIELD_TYPE_WITH_VALUES: FieldType = {
    id: 'Organisation',
    type: 'Complex',
    complex_fields: [
      ({
        id: 'OrganisationID',
        label: 'Organisation ID',
        display_context: 'MANDATORY',
        field_type: {
          id: 'Text',
          type: 'Text'
        },
        value: 'O111111'
      }) as CaseField,
      ({
        id: 'OrganisationName',
        label: 'Organisation Name',
        display_context: 'MANDATORY',
        field_type: {
          id: 'Text',
          type: 'Text'
        },
        value: 'Test organisation name'
      }) as CaseField
    ]
  };
  const CASE_FIELD: CaseField = ({
    id: 'respondentOrganisation',
    label: 'Complex Field',
    display_context: 'OPTIONAL',
    field_type: FIELD_TYPE_WITH_VALUES
  }) as CaseField;
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
  let convertHrefToRouterService: ConvertHrefToRouterService;

  beforeEach(waitForAsync(() => {
    convertHrefToRouterService = jasmine.createSpyObj('ConvertHrefToRouterService', ['updateHrefLink']);
    TestBed.configureTestingModule({
      imports: [
        ConditionalShowModule,
        CommonModule,
        HttpClientTestingModule,
        ReactiveFormsModule,
        PaletteUtilsModule
      ],
      declarations: [
        CaseReferencePipe,
        MarkdownComponent,
        ReadOrganisationFieldTableComponent,
        FieldsFilterPipe,
        MockRpxTranslatePipe,
        fieldReadComponentMock
      ],
      providers: [
        PaletteService,
        { provide: OrganisationService, useValue: mockOrganisationService },
        { provide: ConvertHrefToRouterService, useValue: convertHrefToRouterService },
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
    component.caseField.value = {OrganisationID: 'O333333', OrganisationName: 'The Ethical solicitor'};
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should read selected organisation', waitForAsync(() => {
    component.selectedOrg$.subscribe((selectedOrg) => {
      expect(selectedOrg.organisationIdentifier).toEqual('O333333');
      expect(selectedOrg.name).toEqual('The Ethical solicitor');
      expect(selectedOrg.address).toEqual('Davidson House<br>33<br>The square<br>Reading<br>Berkshire<br>UK<br>RG11EB<br>');
    });
  }));
});
