import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WriteOrganisationFieldComponent } from './write-organisation-field.component';
import { MarkdownModule } from '../../markdown';
import { WindowService } from '../../../services/window';
import { OrganisationConverter } from '../../../domain/organisation';
import { WriteOrganisationComplexFieldComponent } from './write-organisation-complex-field.component';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

describe('WrieteOrganisationFieldComponent', () => {
  let component: WriteOrganisationFieldComponent;
  let fixture: ComponentFixture<WriteOrganisationFieldComponent>;
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
        WindowService,
        OrganisationConverter
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WriteOrganisationFieldComponent);
    component = fixture.componentInstance;
    component.registerControl = REGISTER_CONTROL;
    fixture.detectChanges();
  });

  it('should create', () => {
    component.organisations = [];
    expect(component).toBeTruthy();
  });
});
