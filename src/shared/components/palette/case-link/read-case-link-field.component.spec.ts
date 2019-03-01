import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReadCaseLinkFieldComponent } from './read-case-link-field.component';
import { DebugElement } from '@angular/core';
import { FieldType } from '../../../domain/definition/field-type.model';
import { CaseField } from '../../../domain/definition/case-field.model';
import { CaseReferencePipe } from '../../../pipes/case-reference/case-reference.pipe';
import { By } from '@angular/platform-browser';
import { newCaseField } from '../../../fixture';

const $LINK = By.css('a');
const CASE_REFERENCE_RAW = '1234123412341238';
const CASE_REFERENCE_FORMATTED = '1234-1234-1234-1238';

describe('ReadCaseLinkFieldComponent', () => {

  const FIELD_TYPE: FieldType = {
    id: 'CaseLink',
    type: 'Complex'
  };
  const VALUE = {
    CaseReference: CASE_REFERENCE_RAW
  };
  const CASE_FIELD: CaseField = newCaseField( 'aCaseLink', 'A case link', null,  FIELD_TYPE, 'READONLY').withValue(VALUE).build();

  let fixture: ComponentFixture<ReadCaseLinkFieldComponent>;
  let component: ReadCaseLinkFieldComponent;
  let de: DebugElement;

  beforeEach(async(() => {
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
