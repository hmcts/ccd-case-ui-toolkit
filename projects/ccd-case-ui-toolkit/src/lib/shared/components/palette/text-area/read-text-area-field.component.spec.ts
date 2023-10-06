import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormGroup } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { CaseField } from '../../../domain/definition/case-field.model';
import { FieldType } from '../../../domain/definition/field-type.model';
import { text } from '../../../test/helpers';
import { MockRpxTranslatePipe } from '../../../test/mock-rpx-translate.pipe';
import { ReadTextAreaFieldComponent } from './read-text-area-field.component';

describe('ReadTextAreaFieldComponent', () => {

  const $SPAN = By.css('span');

  const FIELD_ID = 'ReadOnlyFieldId';
  const FIELD_TYPE: FieldType = {
    id: 'Text',
    type: 'Text'
  };
  const VALUE = 'Hello world';

  describe('Non-persistable readonly textarea field', () => {
    const CASE_FIELD: CaseField = ({
      id: 'x',
      label: 'X',
      display_context: 'OPTIONAL',
      field_type: FIELD_TYPE,
      value: VALUE
    }) as CaseField;

    let fixture: ComponentFixture<ReadTextAreaFieldComponent>;
    let component: ReadTextAreaFieldComponent;
    let de: DebugElement;

    beforeEach(waitForAsync(() => {
      TestBed
        .configureTestingModule({
          imports: [],
          declarations: [
            ReadTextAreaFieldComponent,
            MockRpxTranslatePipe
          ],
          providers: []
        })
        .compileComponents();

      fixture = TestBed.createComponent(ReadTextAreaFieldComponent);
      component = fixture.componentInstance;

      component.caseField = CASE_FIELD;

      de = fixture.debugElement;
      fixture.detectChanges();
    }));

    it('render provided value as text', () => {
      component.caseField.value = VALUE;
      fixture.detectChanges();

      const span = de.query($SPAN);

      expect(text(span)).toEqual(VALUE.toString());
    });

    it('render undefined value as empty string', () => {
      component.caseField.value = undefined;
      fixture.detectChanges();

      const span = de.query($SPAN);

      expect(text(span)).toBeNull();
    });

    it('render null value as empty string', () => {
      component.caseField.value = null;
      fixture.detectChanges();

      const span = de.query($SPAN);

      expect(text(span)).toBeNull();
    });

    it('render text using `pre-wrap` styling to render line breaks', () => {
      component.caseField.value = 'line1\nLine2';
      fixture.detectChanges();

      const span = de.query($SPAN);

      const whiteSpace = window.getComputedStyle(span.nativeElement, null).getPropertyValue('white-space');
      expect(whiteSpace).toEqual('pre-wrap');
    });
  });

  describe('Persistable readonly textarea field', () => {
    const FORM_GROUP: FormGroup = new FormGroup({});
    const CASE_FIELD: CaseField = ({
      id: FIELD_ID,
      label: 'X',
      display_context: 'OPTIONAL',
      field_type: FIELD_TYPE,
      value: VALUE
    }) as CaseField;

    let fixture: ComponentFixture<ReadTextAreaFieldComponent>;
    let component: ReadTextAreaFieldComponent;
    let de: DebugElement;

    beforeEach(waitForAsync(() => {
      TestBed
        .configureTestingModule({
          imports: [],
          declarations: [
            ReadTextAreaFieldComponent,
            MockRpxTranslatePipe
          ]
        })
        .compileComponents();

      fixture = TestBed.createComponent(ReadTextAreaFieldComponent);
      component = fixture.componentInstance;

      component.caseField = CASE_FIELD;
      component.formGroup = FORM_GROUP;

      de = fixture.debugElement;
      fixture.detectChanges();
    }));

    it('should register readonly case field value with form group', () => {
      expect(FORM_GROUP.controls[FIELD_ID]).toBeTruthy();
      expect(FORM_GROUP.controls[FIELD_ID].value).toBe(VALUE);
    });

  });

});
