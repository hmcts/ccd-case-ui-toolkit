import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReadOrganisationFieldTableComponent } from './read-organisation-field-table.component';
import { MarkdownModule } from '../../markdown';
import { ReactiveFormsModule } from '@angular/forms';
import { BaseFieldModule } from '../base-field';
import { ConditionalShowModule } from '../../../directives/conditional-show';
import { CommonModule } from '@angular/common';
import { FieldsFilterPipe } from '../complex';
import { PaletteUtilsModule } from '../utils';
import { CaseField, FieldType } from '../../../domain/definition';
import { PaletteService } from '../palette.service';
import { MockComponent } from 'ng2-mock-component';

describe('ReadOrganisationFieldTableComponent', () => {
  let component: ReadOrganisationFieldTableComponent;
  let fixture: ComponentFixture<ReadOrganisationFieldTableComponent>;
  let FieldReadComponent = MockComponent({
    selector: 'ccd-field-read',
    inputs: ['caseField', 'context']
  });
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

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        ConditionalShowModule,
        CommonModule,
        ReactiveFormsModule,
        MarkdownModule,
        PaletteUtilsModule,
        // BaseFieldModule
      ],
      declarations: [
        ReadOrganisationFieldTableComponent,
        FieldsFilterPipe,
        FieldReadComponent
      ],
      providers: [
        PaletteService
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReadOrganisationFieldTableComponent);
    component = fixture.componentInstance;
    component.caseField = CASE_FIELD;
    component.caseFields = [CASE_FIELD];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
