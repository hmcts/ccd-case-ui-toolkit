import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReadOrganisationFieldComponent } from './read-organisation-field.component';
import { of } from 'rxjs';
import { ReadOrganisationFieldRawComponent } from './read-organisation-field-raw.component';
import { ReadOrganisationFieldTableComponent } from './read-organisation-field-table.component';
import { MarkdownModule } from '../../markdown';
import { CaseField } from '../../../domain/definition';
import { PaletteContext } from '../base-field';
import { PaletteService } from '../palette.service';
import { OrganisationService } from '../../../services/organisation';
import { OrganisationConverter } from '../../../domain/organisation';

describe('ReadOrganisationFieldComponent', () => {
  let component: ReadOrganisationFieldComponent;
  let fixture: ComponentFixture<ReadOrganisationFieldComponent>;
  const mockOrganisationService = jasmine.createSpyObj<OrganisationService>('OrganisationService', ['getActiveOrganisations']);
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
        MarkdownModule
      ],
      declarations: [
        ReadOrganisationFieldComponent,
        ReadOrganisationFieldRawComponent,
        ReadOrganisationFieldTableComponent
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
    fixture = TestBed.createComponent(ReadOrganisationFieldComponent);
    component = fixture.componentInstance;
    component.caseField = new CaseField();
    component.caseField.display_context_parameter = 'test';
    mockOrganisationService.getActiveOrganisations.and.returnValue(of(ORGANISATIONS));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.context).toEqual(PaletteContext.TABLE_VIEW);
  });

});
