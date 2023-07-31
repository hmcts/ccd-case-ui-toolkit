import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CaseField } from '../../../domain/definition/case-field.model';
import { FieldType } from '../../../domain/definition/field-type.model';
import { MockRpxTranslatePipe } from '../../../test/mock-rpx-translate.pipe';
import { DynamicRadioListPipe } from './dynamic-radio-list.pipe';
import { ReadDynamicRadioListFieldComponent } from './read-dynamic-radio-list-field.component';
import { MockRpxTranslatePipe } from '../../../test/mock-rpx-translate.pipe';

describe('ReadDynamicRadioListFieldComponent', () => {

  const VALUE = 'F';
  const EXPECTED_LABEL = 'Female';
  const FIELD_ID = 'ReadOnlyFieldId';
  const FIELD_LIST_ITEMS = [
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
  ];
  const FIELD_TYPE: FieldType = {
    id: 'Gender',
    type: 'DynamicRadioList'
  };

  describe('Non-persistable readonly fixed radio list field', () => {
    const CASE_FIELD: CaseField = ({
      id: 'x',
      label: 'X',
      display_context: 'OPTIONAL',
      field_type: FIELD_TYPE,
      value: FIELD_LIST_ITEMS[1],
      list_items: FIELD_LIST_ITEMS
    }) as CaseField;
    const EMPTY = '';

    const CASE_FIELD_2: CaseField = ({
      id: 'x',
      label: 'X',
      display_context: 'OPTIONAL',
      field_type: FIELD_TYPE,
      formatted_value: {
        code: FIELD_LIST_ITEMS[1],
        list_items: FIELD_LIST_ITEMS
      }
    }) as CaseField;

    const CASE_FIELD_3: CaseField = ({
      id: 'x',
      label: 'X',
      display_context: 'OPTIONAL',
      field_type: FIELD_TYPE,
      value: {
        code: FIELD_LIST_ITEMS[1],
        list_items: FIELD_LIST_ITEMS
      }
    }) as CaseField;

    let fixture: ComponentFixture<ReadDynamicRadioListFieldComponent>;
    let component: ReadDynamicRadioListFieldComponent;
    let de: DebugElement;

    beforeEach(waitForAsync(() => {
      TestBed
        .configureTestingModule({
          imports: [],
          declarations: [
            ReadDynamicRadioListFieldComponent,
            DynamicRadioListPipe,
            MockRpxTranslatePipe
          ],
          providers: []
        })
        .compileComponents();

      fixture = TestBed.createComponent(ReadDynamicRadioListFieldComponent);
      component = fixture.componentInstance;

      component.caseField = CASE_FIELD;

      de = fixture.debugElement;
      fixture.detectChanges();
    }));

    it('should render label associated to the value provided', () => {
      component.caseField.value = VALUE;
      fixture.detectChanges();

      expect(de.nativeElement.textContent).toEqual(EXPECTED_LABEL);
    });

    it('should render label associated to the formatted value provided', () => {
      component.caseField = CASE_FIELD_2;
      component.ngOnInit();
      component.caseField.value = VALUE;
      fixture.detectChanges();

      expect(de.nativeElement.textContent).toEqual(EXPECTED_LABEL);
    });

    it('should populate list_items when formatted value is empty', () => {
      component.caseField = CASE_FIELD_3;
      component.ngOnInit();
      component.caseField.value = VALUE;
      fixture.detectChanges();

      expect(de.nativeElement.textContent).toEqual(EXPECTED_LABEL);
    });

    it('should render undefined value as empty string', () => {
      component.caseField.value = undefined;
      fixture.detectChanges();

      expect(de.nativeElement.textContent).toEqual(EMPTY);
    });

    it('should render null value as empty string', () => {
      component.caseField.value = null;
      fixture.detectChanges();

      expect(de.nativeElement.textContent).toEqual(EMPTY);
    });
  });

});
