import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { CaseField, FieldType } from '../../../domain/definition';
import { createFieldType, newCaseField } from '../../../fixture';
import { text } from '../../../test/helpers';
import { MockRpxTranslatePipe } from '../../../test/mock-rpx-translate.pipe';
import { FieldReadLabelComponent } from './field-read-label.component';

const CASE_FIELD: CaseField = newCaseField('PersonFirstName', 'First name', null, null, 'OPTIONAL')
  .withValue('Johnny').build();

const CASE_REFERENCE_TYPE: FieldType = createFieldType('TextCaseReference', 'Text', [], null);
const CASE_REFERENCE: CaseField = newCaseField('CaseReference', 'Case Reference', null, CASE_REFERENCE_TYPE, 'READONLY').build();
const CASE_LINK_TYPE: FieldType = createFieldType('CaseLink', 'Complex', [CASE_REFERENCE], null);
const CASE_LINK_FIELD: CaseField = newCaseField('CaseLinkField', 'Case Link', null, CASE_LINK_TYPE, 'OPTIONAL')
  .withValue('Johnny').build();

const CASE_FIELD_OF_LABEL_TYPE: CaseField = newCaseField('PersonFirstName', 'First name', null,
  createFieldType('Text', 'Label'), 'OPTIONAL').withValue('Johnny').build();
const BY_FIELD_LABEL = By.css('.case-field__label');

describe('FieldReadLabelComponent', () => {

  let fixture: ComponentFixture<FieldReadLabelComponent>;
  let component: FieldReadLabelComponent;
  let de: DebugElement;

  beforeEach(waitForAsync(() => {

    TestBed
      .configureTestingModule({
        imports: [
          FormsModule
        ],
        declarations: [
          FieldReadLabelComponent,
          MockRpxTranslatePipe
        ],
        providers: []
      })
      .compileComponents();

    fixture = TestBed.createComponent(FieldReadLabelComponent);
    component = fixture.componentInstance;

    component.caseField = CASE_FIELD;
    component.withLabel = true;

    de = fixture.debugElement;
    fixture.detectChanges();
  }));

  describe('translation guards', () => {
    let translateSpy: jasmine.Spy;

    beforeEach(() => {
      translateSpy = spyOn(MockRpxTranslatePipe.prototype, 'transform')
        .and.callFake((value: string) => `Translated: ${value}`);
      component.caseField = Object.assign(new CaseField(), CASE_FIELD, { label: 'Ordinary label' });
    });

    it('should translate an ordinary unhandled label', () => {
      fixture.detectChanges();

      expect(text(de.query(BY_FIELD_LABEL))).toBe('Translated: Ordinary label');
      expect(translateSpy).toHaveBeenCalledWith('Ordinary label');
    });

    (['isTranslated', 'translationHandledLocally'] as const).forEach(flag => {
      it(`should display the label directly when ${flag} is true`, () => {
        component.caseField.label = 'Resolved PRIVATE_NAME';
        component.caseField[flag] = true;
        fixture.detectChanges();

        expect(text(de.query(BY_FIELD_LABEL))).toBe('Resolved PRIVATE_NAME');
        expect(translateSpy).not.toHaveBeenCalled();
      });
    });

    it('should render locally handled English fallback and Welsh updates without another lookup', () => {
      // Translation belongs to the caller; the wrapper renders the supplied state.
      component.caseField.translationHandledLocally = true;
      component.caseField.label = 'English fallback PRIVATE_NAME';
      fixture.detectChanges();

      expect(component.caseField.isTranslated).toBe(false);
      expect(text(de.query(BY_FIELD_LABEL))).toBe('English fallback PRIVATE_NAME');

      component.caseField.label = 'Welsh result PRIVATE_NAME';
      component.caseField.isTranslated = true;
      fixture.detectChanges();

      expect(text(de.query(BY_FIELD_LABEL))).toBe('Welsh result PRIVATE_NAME');
      expect(translateSpy).not.toHaveBeenCalled();
    });

    it('should still omit the heading for a locally handled Label field', () => {
      component.caseField = Object.assign(new CaseField(), CASE_FIELD_OF_LABEL_TYPE, {
        translationHandledLocally: true
      });
      fixture.detectChanges();

      expect(de.query(BY_FIELD_LABEL)).toBeNull();
      expect(translateSpy).not.toHaveBeenCalled();
    });

    it('should still omit the heading for an ordinary Complex field', () => {
      component.caseField.field_type = createFieldType('Complex', 'Complex', []);
      component.caseField.translationHandledLocally = true;
      fixture.detectChanges();

      expect(de.query(BY_FIELD_LABEL)).toBeNull();
      expect(translateSpy).not.toHaveBeenCalled();
    });

    it('should display a locally handled CaseLink heading directly', () => {
      component.caseField = Object.assign(new CaseField(), CASE_LINK_FIELD, {
        label: 'Case link PRIVATE_NAME',
        translationHandledLocally: true
      });
      fixture.detectChanges();

      expect(text(de.query(BY_FIELD_LABEL))).toBe('Case link PRIVATE_NAME');
      expect(translateSpy).not.toHaveBeenCalled();
    });
  });

  it('should display label when `withLabel` is true', () => {
    component.withLabel = true;
    fixture.detectChanges();

    const label = de.query(BY_FIELD_LABEL);
    expect(label).toBeTruthy();
    expect(text(label)).toEqual(CASE_FIELD.label);
  });

  it('should NOT display label when `withLabel` is true but case field is of Label type', () => {
    component.caseField = CASE_FIELD_OF_LABEL_TYPE;
    component.withLabel = true;
    fixture.detectChanges();

    const label = de.query(BY_FIELD_LABEL);
    expect(label).toBeFalsy();
  });

  it('should NOT display label when `withLabel` is false', () => {
    component.withLabel = false;
    fixture.detectChanges();

    const label = de.query(BY_FIELD_LABEL);
    expect(label).toBeFalsy();
  });

  it('should display label for a CaseLink', () => {
    component.caseField = CASE_LINK_FIELD;
    component.withLabel = true;
    fixture.detectChanges();

    const label = de.query(BY_FIELD_LABEL);
    expect(label).toBeTruthy();
    expect(text(label)).toEqual(CASE_LINK_FIELD.label);
  });
});
