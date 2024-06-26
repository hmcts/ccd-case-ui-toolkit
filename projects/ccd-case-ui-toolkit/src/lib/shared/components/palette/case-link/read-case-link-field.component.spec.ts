import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormGroup } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { CaseField } from '../../../domain/definition/case-field.model';
import { FieldType } from '../../../domain/definition/field-type.model';
import { CaseReferencePipe } from '../../../pipes/case-reference/case-reference.pipe';
import { ReadCaseLinkFieldComponent } from './read-case-link-field.component';

const $LINK = By.css('a');
const CASE_REFERENCE_RAW = '1234123412341238';
const CASE_REFERENCE_FORMATTED = '1234-1234-1234-1238';

describe('ReadCaseLinkFieldComponent', () => {
  const FIELD_ID = 'ReadOnlyFieldId';
  const FIELD_TYPE: FieldType = {
    id: 'CaseLink',
    type: 'Complex'
  };
  const VALUE = {
    CaseReference: CASE_REFERENCE_RAW
  };

  describe('Non-persistable readonly case-link field', () => {
    const FORM_GROUP: FormGroup = new FormGroup({});
    const CASE_FIELD: CaseField = {
      id: 'aCaseLink',
      label: 'A case link',
      field_type: FIELD_TYPE,
      value: VALUE,
      display_context: 'READONLY'
    } as CaseField;

    let fixture: ComponentFixture<ReadCaseLinkFieldComponent>;
    let component: ReadCaseLinkFieldComponent;
    let de: DebugElement;

    beforeEach(waitForAsync(() => {
      TestBed
        .configureTestingModule({
          imports: [],
          declarations: [
            ReadCaseLinkFieldComponent,
            CaseReferencePipe
          ],
          providers: []
        })
        .compileComponents();

      fixture = TestBed.createComponent(ReadCaseLinkFieldComponent);
      component = fixture.componentInstance;

      component.caseField = CASE_FIELD;
      component.formGroup = FORM_GROUP;

      de = fixture.debugElement;
      fixture.detectChanges();
    }));

    it('render provided reference as link', () => {
      component.caseField.value = VALUE;
      fixture.detectChanges();

      const linkDe = de.query($LINK);

      expect(linkDe).toBeTruthy();
      expect(linkDe.nativeElement.textContent).toEqual(CASE_REFERENCE_FORMATTED);
    });

    it('render undefined value as empty string', () => {
      component.caseField.value = undefined;
      fixture.detectChanges();

      expect(de.nativeElement.textContent).toEqual('');
    });

    it('render null value as empty string', () => {
      component.caseField.value = null;
      fixture.detectChanges();

      expect(de.nativeElement.textContent).toEqual('');
    });

  });

  describe('Persistable readonly case-link field', () => {
    const FORM_GROUP: FormGroup = new FormGroup({});
    const CASE_FIELD: CaseField = {
      id: FIELD_ID,
      label: 'A case link',
      field_type: FIELD_TYPE,
      value: VALUE,
      display_context: 'READONLY'
    } as CaseField;

    let fixture: ComponentFixture<ReadCaseLinkFieldComponent>;
    let component: ReadCaseLinkFieldComponent;
    let de: DebugElement;

    beforeEach(waitForAsync(() => {
      TestBed
        .configureTestingModule({
          imports: [],
          declarations: [
            ReadCaseLinkFieldComponent,
            CaseReferencePipe
          ],
          providers: []
        })
        .compileComponents();

      fixture = TestBed.createComponent(ReadCaseLinkFieldComponent);
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
