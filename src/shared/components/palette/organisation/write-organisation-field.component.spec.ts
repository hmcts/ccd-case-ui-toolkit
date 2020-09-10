import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WriteOrganisationFieldComponent } from './write-organisation-field.component';
import { MarkdownModule } from '../../markdown';
import { OrganisationConverter } from '../../../domain/organisation';
import { WriteOrganisationComplexFieldComponent } from './write-organisation-complex-field.component';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { OrganisationService } from '../../../services/organisation';
import { of } from 'rxjs';

describe('WrieteOrganisationFieldComponent', () => {
  let component: WriteOrganisationFieldComponent;
  let fixture: ComponentFixture<WriteOrganisationFieldComponent>;
  const mockOrganisationService = jasmine.createSpyObj<OrganisationService>('OrganisationService', ['getActiveOrganisations']);

  const FORM_GROUP: FormGroup = new FormGroup({});
  const REGISTER_CONTROL = (control) => {
    FORM_GROUP.addControl('OrganisationId', control);
    FORM_GROUP.addControl('OrganisationName', control);
    return control;
  };
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MarkdownModule,
        ReactiveFormsModule
      ],
      declarations: [
        WriteOrganisationFieldComponent,
        WriteOrganisationComplexFieldComponent
      ],
      providers: [
        { provide: OrganisationService, useValue: mockOrganisationService },
        OrganisationConverter
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WriteOrganisationFieldComponent);
    component = fixture.componentInstance;
    component.registerControl = REGISTER_CONTROL;
    mockOrganisationService.getActiveOrganisations.and.returnValue(of([]));
    fixture.detectChanges();
  });

  it('should create', () => {
    component.organisations = [];
    expect(component).toBeTruthy();
  });
});
