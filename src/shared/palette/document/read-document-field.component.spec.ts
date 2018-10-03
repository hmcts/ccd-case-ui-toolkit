import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReadDocumentFieldComponent } from './read-document-field.component';
import { DebugElement } from '@angular/core';
import { FieldType } from '../../domain/definition/field-type.model';
import { CaseField } from '../../domain/definition/case-field.model';
import { attr, text } from '../../../test/helpers';
import createSpyObj = jasmine.createSpyObj;
import { By } from '@angular/platform-browser';
import { DocumentUrlPipe } from './document-url.pipe';
import { AbstractAppConfig } from '../../../app.config';
import { AppConfig } from '../../fixture/shared.fixture';

describe('ReadDocumentFieldComponent', () => {

  const FIELD_TYPE: FieldType = {
    id: 'Document',
    type: 'Document'
  };
  const VALUE = {
    'document_url': 'https://www.example.com',
    'document_binary_url': 'https://www.example.com/binary',
    'document_filename': 'evidence_document.evd'
  };
  const CASE_FIELD: CaseField = {
    id: 'x',
    label: 'X',
    display_context: 'OPTIONAL',
    field_type: FIELD_TYPE,
    value: VALUE
  };
  const GATEWAY_DOCUMENT_URL = 'http://localhost:1234/documents';

  let fixture: ComponentFixture<ReadDocumentFieldComponent>;
  let component: ReadDocumentFieldComponent;
  let de: DebugElement;
  let mockAppConfig: any;

  beforeEach(() => {
    mockAppConfig = createSpyObj<AppConfig>('AppConfig', ['getDocumentManagementUrl', 'getRemoteDocumentManagementUrl']);
    mockAppConfig.getDocumentManagementUrl.and.returnValue(GATEWAY_DOCUMENT_URL);
    mockAppConfig.getRemoteDocumentManagementUrl.and.returnValue(VALUE.document_binary_url);

    TestBed
      .configureTestingModule({
        imports: [],
        declarations: [
          ReadDocumentFieldComponent,
          DocumentUrlPipe
        ],
        providers: [
          { provide: AbstractAppConfig, useValue: mockAppConfig }
        ]
      })
      .compileComponents();

    fixture = TestBed.createComponent(ReadDocumentFieldComponent);
    component = fixture.componentInstance;

    component.caseField = CASE_FIELD;

    de = fixture.debugElement;
    fixture.detectChanges();
  });

  it('should render provided value as a clickable URL', () => {
    component.caseField.value = VALUE;
    fixture.detectChanges();

    expect(text(de)).toEqual(VALUE.document_filename.toString());
    let linkElement = de.query(By.css('a'));
    expect(linkElement).toBeTruthy();
    expect(attr(linkElement, 'href')).toEqual(GATEWAY_DOCUMENT_URL);
  });

  it('should render undefined value as empty string', () => {
    component.caseField.value = undefined;
    fixture.detectChanges();

    expect(de.nativeElement.textContent).toEqual('');
  });

  it('should render null value as empty string', () => {
    component.caseField.value = null;
    fixture.detectChanges();

    expect(de.nativeElement.textContent).toEqual('');
  });
});
