import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReadTextAreaFieldComponent } from './read-text-area-field.component';
import { DebugElement } from '@angular/core';
import { FieldType } from '../../../domain/definition/field-type.model';
import { CaseField } from '../../../domain/definition/case-field.model';
import { By } from '@angular/platform-browser';
import { text } from '../../../test/helpers';
import { newCaseField } from '../../../fixture';

describe('ReadTextAreaFieldComponent', () => {

  const $SPAN = By.css('span');

  const FIELD_TYPE: FieldType = {
    id: 'Text',
    type: 'Text'
  };
  const VALUE = 'Hello world';
  const CASE_FIELD: CaseField = newCaseField('x', 'X', null, FIELD_TYPE, 'OPTIONAL').withValue(VALUE).build();

  let fixture: ComponentFixture<ReadTextAreaFieldComponent>;
  let component: ReadTextAreaFieldComponent;
  let de: DebugElement;

  beforeEach(async(() => {
    TestBed
      .configureTestingModule({
        imports: [],
        declarations: [
          ReadTextAreaFieldComponent
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

    let span = de.query($SPAN);

    expect(text(span)).toEqual(VALUE.toString());
  });

  it('render undefined value as empty string', () => {
    component.caseField.value = undefined;
    fixture.detectChanges();

    let span = de.query($SPAN);

    expect(text(span)).toBeNull();
  });

  it('render null value as empty string', () => {
    component.caseField.value = null;
    fixture.detectChanges();

    let span = de.query($SPAN);

    expect(text(span)).toBeNull();
  });

  it('render text using `pre-wrap` styling to render line breaks', () => {
    component.caseField.value = 'line1\nLine2';
    fixture.detectChanges();

    let span = de.query($SPAN);

    let whiteSpace = window.getComputedStyle(span.nativeElement, null).getPropertyValue('white-space');
    expect(whiteSpace).toEqual('pre-wrap');
  });
});
