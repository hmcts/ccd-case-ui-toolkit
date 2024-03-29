import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { CaseField } from '../../../domain/definition/case-field.model';
import { FieldType } from '../../../domain/definition/field-type.model';
import { MockFieldLabelPipe } from '../../../test/mock-field-label.pipe';
import { MockRpxTranslatePipe } from '../../../test/mock-rpx-translate.pipe';
import { PaletteUtilsModule } from '../utils/utils.module';
import { WriteFixedListFieldComponent } from './write-fixed-list-field.component';

const VALUE = 'F';
const EXPECTED_LABEL = 'Female';
const FIELD_ID = 'MarritalStatus';
const FIELD_TYPE: FieldType = {
  id: 'Gender',
  type: 'FixedList',
  fixed_list_items: [
    {
      code: 'M',
      label: 'Male',
      order: 1
    },
    {
      code: VALUE,
      label: EXPECTED_LABEL,
      order: 2
    },
    {
      code: 'O',
      label: 'Other',
      order: 3
    }
  ]
};
const CASE_FIELD: CaseField = Object.assign(new CaseField(), {
  id: FIELD_ID,
  label: 'X',
  display_context: 'OPTIONAL',
  field_type: FIELD_TYPE,
  value: VALUE
});

describe('WriteFixedListFieldComponent', () => {

  const $SELECT = By.css('.form-group select');
  const $OPTION = By.css('.form-group option');

  let fixture: ComponentFixture<WriteFixedListFieldComponent>;
  let component: WriteFixedListFieldComponent;
  let de: DebugElement;

  beforeEach(waitForAsync(() => {
    TestBed
      .configureTestingModule({
        imports: [
          ReactiveFormsModule,
          PaletteUtilsModule,
          FormsModule
        ],
        declarations: [
          WriteFixedListFieldComponent,
          MockRpxTranslatePipe,
          MockFieldLabelPipe
        ],
        providers: [],
        teardown: { destroyAfterEach: false }
      })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WriteFixedListFieldComponent);
    component = fixture.componentInstance;
    component.caseField = CASE_FIELD;
    const FORM_GROUP: FormGroup = new FormGroup({});

    de = fixture.debugElement;
    fixture.detectChanges();
  });

  it('should select default value', () => {
    component.fixedListFormControl.setValue(null);
    fixture.detectChanges();
    const options = de.queryAll($OPTION);

    expect(options.length).toEqual(4);
    expect(options[0].nativeElement.textContent).toEqual('--Select a value--');
    expect(options[1].nativeElement.textContent).toEqual('Male');
    expect(options[2].nativeElement.textContent).toEqual('Female');
    expect(options[3].nativeElement.textContent).toEqual('Other');
    fixture
      .whenStable()
      .then(() => {
        const select = de.query($SELECT);
        expect(select.nativeElement.selectedIndex).toEqual(0);
      });
  });

  it('should render all options', () => {
    const options = de.queryAll($OPTION);
    expect(options[0].nativeElement.textContent).toEqual('--Select a value--');
    expect(options[1].nativeElement.textContent).toEqual('Male');
    expect(options[2].nativeElement.textContent).toEqual('Female');
    expect(options[3].nativeElement.textContent).toEqual('Other');
  });

  it('should link select element to formControl', waitForAsync(() => {
    component.fixedListFormControl.setValue('M');
    fixture.detectChanges();
    fixture
      .whenStable()
      .then(() => {
        const select = de.query($SELECT);
        expect(select.nativeElement.selectedIndex).toEqual(1);
      });
  }));
});
