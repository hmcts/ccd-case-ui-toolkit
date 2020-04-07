import { CaseField } from '../../../domain/definition/case-field.model';
import { FieldType } from '../../../domain/definition/field-type.model';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WriteDocumentFieldComponent } from './write-document-field.component';
import { DebugElement } from '@angular/core';
import { DocumentManagementService } from '../../../services/document-management/document-management.service';
import { DocumentData } from '../../../domain/document/document-data.model';
import { of, throwError, Subscription } from 'rxjs';
import { By } from '@angular/platform-browser';
import { MockComponent } from 'ng2-mock-component';
import { FormGroup } from '@angular/forms';
import { FieldLabelPipe } from '../utils/field-label.pipe';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material';
import { DocumentDialogComponent } from '../../dialogs/document-dialog/document-dialog.component';
import createSpyObj = jasmine.createSpyObj;
import any = jasmine.any;
import { FileUploadStateService } from './file-upload-state.service';

const FIELD_TYPE: FieldType = {
  id: 'Document',
  type: 'Document'
};
const VALUE = {
  'document_url': 'https://www.example.com',
  'document_binary_url': 'https://www.example.com/binary',
  'document_filename': 'evidence_document.evd'
};
const CASE_FIELD: CaseField = <CaseField>({
  id: 'x',
  label: 'X',
  display_context: 'OPTIONAL',
  field_type: FIELD_TYPE,
  value: VALUE
});

const DOCUMENT_MANAGEMENT_URL = 'http://docmanagement.ccd.reform/documents';
const RESPONSE_FIRST_DOCUMENT: DocumentData = {
  _embedded: {
    documents: [{
      originalDocumentName: 'howto.pdf',
      _links: {
        self: {
          href: DOCUMENT_MANAGEMENT_URL + '/abcd0123'
        },
        binary: {
          href: DOCUMENT_MANAGEMENT_URL + '/abcd0123/binary'
        }
      }
    }]
  }
};
const RESPONSE_SECOND_DOCUMENT: DocumentData = {
  _embedded: {
    documents: [{
      originalDocumentName: 'plop.pdf',
      _links: {
        self: {
          href: DOCUMENT_MANAGEMENT_URL + '/cdef4567'
        },
        binary: {
          href: DOCUMENT_MANAGEMENT_URL + '/cdef4567/binary'
        }
      }
    }]
  }
};

describe('WriteDocumentFieldComponent', () => {

  const FORM_GROUP_ID = 'document_url';
  const FORM_GROUP = new FormGroup({});
  const REGISTER_CONTROL = (control) => {
    FORM_GROUP.addControl(FORM_GROUP_ID, control);
    return control;
  };
  const DIALOG_CONFIG = new MatDialogConfig();
  const $DIALOG_REPLACE_BUTTON = By.css('.button[title=Replace]');
  const $DIALOG_CANCEL_BUTTON = By.css('.button[title=Cancel]');

  let ReadDocumentComponent = MockComponent({
    selector: 'ccd-read-document-field',
    inputs: ['caseField']
  });

  let fixture: ComponentFixture<WriteDocumentFieldComponent>;
  let component: WriteDocumentFieldComponent;
  let de: DebugElement;
  let mockDocumentManagementService: any;
  let mockFileUploadStateService: any;

  let fixtureDialog: ComponentFixture<DocumentDialogComponent>;
  let componentDialog: DocumentDialogComponent;
  let deDialog: DebugElement;
  let dialog: any;
  let matDialogRef: MatDialogRef<DocumentDialogComponent>;

  beforeEach(() => {
    mockDocumentManagementService = createSpyObj<DocumentManagementService>('documentManagementService', ['uploadFile']);
    mockDocumentManagementService.uploadFile.and.returnValues(
      of(RESPONSE_FIRST_DOCUMENT),
      of(RESPONSE_SECOND_DOCUMENT)
    );
    dialog = createSpyObj<MatDialog>('dialog', ['open']);
    matDialogRef = createSpyObj<MatDialogRef<DocumentDialogComponent>>('matDialogRef', ['close']);

    mockFileUploadStateService = createSpyObj<FileUploadStateService>('fileUploadStateService', [
      'setUploadInProgress',
      'isUploadInProgress'
    ]);

    TestBed
      .configureTestingModule({
        imports: [],
        declarations: [
          WriteDocumentFieldComponent,
          FieldLabelPipe,
          DocumentDialogComponent,
          // Mock
          ReadDocumentComponent,
        ],
        providers: [
          {provide: DocumentManagementService, useValue: mockDocumentManagementService},
          {provide: MatDialog, useValue: dialog},
          {provide: MatDialogRef, useValue: matDialogRef},
          {provide: MatDialogConfig, useValue: DIALOG_CONFIG},
          {provide: FileUploadStateService, useValue: mockFileUploadStateService},
          DocumentDialogComponent
        ]
      })
      .compileComponents();

    fixture = TestBed.createComponent(WriteDocumentFieldComponent);
    component = fixture.componentInstance;

    component.registerControl = REGISTER_CONTROL;
    component.caseField = CASE_FIELD;

    de = fixture.debugElement;
    fixture.detectChanges();
  });

  it('should be valid for the initial component state.', () => {
    console.log('component.caseField', component.caseField);
    expect(component.valid).toBeTruthy();
  });

  it('should render an element for file selection', () => {
    let uploadElement = de.query(By.css('input[type=file]'));

    expect(uploadElement).toBeTruthy();
  });

  it('should render a ccd-read-document-field tag for an existing document', () => {
    let ccdReadDocumentElement = de.query(By.css('ccd-read-document-field'));

    expect(ccdReadDocumentElement).toBeTruthy();
  });

  it('should initialise formControl with provided value', () => {
    expect(FORM_GROUP.controls[FORM_GROUP_ID].value.document_url).toBe(VALUE.document_url);
    expect(FORM_GROUP.controls[FORM_GROUP_ID].value.document_binary_url).toBe(VALUE.document_binary_url);
    expect(FORM_GROUP.controls[FORM_GROUP_ID].value.document_filename).toBe(VALUE.document_filename);
  });

  it('should open file dialog if document does not exist', () => {
    component.caseField.value = null;
    expect(component.caseField.value).toBeFalsy();
    component.fileSelectEvent();
    component.confirmReplaceResult = 'Replace';
    expect(component.triggerReplace()).toBeFalsy();
  });

  it('should upload given document', () => {
    let blobParts: BlobPart[] = ['some contents for blob'];
    let file: File = new File(blobParts, 'test.pdf');
    component.fileChangeEvent({
      target: {
        files: [
          file
        ]
      }
    });
    expect(mockFileUploadStateService.setUploadInProgress).toHaveBeenCalledWith(true);
    expect(mockDocumentManagementService.uploadFile).toHaveBeenCalledWith(any(FormData));
  });

  it('should be invalid if document management throws error', () => {
    mockDocumentManagementService.uploadFile.and.returnValue(throwError('{"error": "A terrible thing happened", ' +
      '"message": "But really really terrible thing!", "status": 502}'));

    let blobParts: BlobPart[] = ['some contents for blob'];
    let file: File = new File(blobParts, 'test.pdf');
    component.fileChangeEvent({
      target: {
        files: [
          file
        ]
      }
    });
    expect(mockFileUploadStateService.setUploadInProgress).toHaveBeenCalledWith(false);
    expect(component.valid).toBeFalsy();
  });

  it('should display dialog only if document exist', () => {
    component.caseField.value = VALUE;
    expect(component.caseField.value).toBeTruthy();
    fixtureDialog = TestBed.createComponent(DocumentDialogComponent);
    componentDialog = fixtureDialog.componentInstance;
    deDialog = fixtureDialog.debugElement;
    fixtureDialog.detectChanges();
    let replaceElement = deDialog.query(By.css('.button[title=Replace]'));
    expect(replaceElement).toBeTruthy();
  });

  it('should trigger the document replace event when replace button is clicked', () => {
    fixtureDialog = TestBed.createComponent(DocumentDialogComponent);
    componentDialog = fixtureDialog.componentInstance;
    deDialog = fixtureDialog.debugElement;
    fixtureDialog.detectChanges();

    let dialogReplacelButton = deDialog.query($DIALOG_REPLACE_BUTTON);
    dialogReplacelButton.nativeElement.click();
    expect(componentDialog.result).toEqual('Replace');
    fixture.detectChanges();
  });

  it('should not trigger the document replace event when cancel button is clicked', () => {
    fixtureDialog = TestBed.createComponent(DocumentDialogComponent);
    componentDialog = fixtureDialog.componentInstance;
    deDialog = fixtureDialog.debugElement;
    fixtureDialog.detectChanges();
    let dialogCancelButton = deDialog.query($DIALOG_CANCEL_BUTTON);
    dialogCancelButton.nativeElement.click();
    expect(componentDialog.result).toEqual('Cancel');
    fixture.detectChanges();
  });

  it('should accept all files', () => {
    const fileElement = de.query(By.css('input[type=file]'));

    expect(fileElement.nativeElement.accept).toBe('');
  });

  it('should accept only the files provided in case field type regular expression', () => {
    const FIELD_TYPE_WITH_REGEX: FieldType = {
      id: 'Document',
      type: 'Document',
      regular_expression: '.pdf,.docx,.xlsx'
    };
    component.caseField = <CaseField>({
      id: 'x',
      label: 'X',
      field_type: FIELD_TYPE_WITH_REGEX,
      value: VALUE
    });

    component.ngOnInit();
    fixture.detectChanges();

    const fileElement = de.query(By.css('input[type=file]'));

    expect(fileElement.nativeElement.accept).toBe(FIELD_TYPE_WITH_REGEX.regular_expression);
  });

  it('should return file upload state', () => {
    mockFileUploadStateService.isUploadInProgress.and.returnValue(true);
    expect(component.isUploadInProgress()).toBeTruthy();
  });

  it('should cancel file upload', () => {
    component.fileUploadSubscription = new Subscription();
    const fileUploadSubscriptionSpy = spyOn(component.fileUploadSubscription, 'unsubscribe');
    component.cancelUpload();

    expect(fileUploadSubscriptionSpy).toHaveBeenCalled();
    expect(mockFileUploadStateService.setUploadInProgress).toHaveBeenCalledWith(false);
    expect(component.valid).toBeTruthy();

  });

});

describe('WriteDocumentFieldComponent with Mandatory casefield', () => {

  const FIELD_TYPE_MANDATORY: FieldType = {
    id: 'Document',
    type: 'Document'
  };
  const VALUE_MANDATORY = {
    'document_url': 'https://www.example.com',
    'document_binary_url': 'https://www.example.com/binary',
    'document_filename': 'evidence_document.evd'
  };

  const CASE_FIELD_MANDATORY: CaseField = <CaseField>({
    id: 'x',
    label: 'X',
    display_context: 'MANDATORY',
    field_type: FIELD_TYPE_MANDATORY,
    value: VALUE_MANDATORY
  });
  const DOCUMENT_MANAGEMENT_URL_MANDATORY = 'http://docmanagement.ccd.reform/documents';
  const RESPONSE_FIRST_DOCUMENT_MANDATORY: DocumentData = {
    _embedded: {
      documents: [{
        originalDocumentName: 'howto.pdf',
        _links: {
          self: {
            href: DOCUMENT_MANAGEMENT_URL_MANDATORY + '/abcd0123'
          },
          binary: {
            href: DOCUMENT_MANAGEMENT_URL_MANDATORY + '/abcd0123/binary'
          }
        }
      }]
    }
  };
  const RESPONSE_SECOND_DOCUMENT_MANDATORY: DocumentData = {
    _embedded: {
      documents: [{
        originalDocumentName: 'plop.pdf',
        _links: {
          self: {
            href: DOCUMENT_MANAGEMENT_URL_MANDATORY + '/cdef4567'
          },
          binary: {
            href: DOCUMENT_MANAGEMENT_URL_MANDATORY + '/cdef4567/binary'
          }
        }
      }]
    }
  };
  const FORM_GROUP_ID = 'document_url';
  const FORM_GROUP = new FormGroup({});
  const REGISTER_CONTROL = (control) => {
    FORM_GROUP.addControl(FORM_GROUP_ID, control);
    return control;
  };
  const DIALOG_CONFIG = new MatDialogConfig();
  const $DIALOG_REPLACE_BUTTON = By.css('.button[title=Replace]');
  const $DIALOG_CANCEL_BUTTON = By.css('.button[title=Cancel]');

  let ReadDocumentComponent = MockComponent({
    selector: 'ccd-read-document-field',
    inputs: ['caseField']
  });

  let fixture: ComponentFixture<WriteDocumentFieldComponent>;
  let component: WriteDocumentFieldComponent;
  let de: DebugElement;
  let mockDocumentManagementService: any;
  let mockFileUploadStateService: any;

  let fixtureDialog: ComponentFixture<DocumentDialogComponent>;
  let componentDialog: DocumentDialogComponent;
  let deDialog: DebugElement;
  let dialog: any;
  let matDialogRef: MatDialogRef<DocumentDialogComponent>;

  beforeEach(() => {
    mockDocumentManagementService = createSpyObj<DocumentManagementService>('documentManagementService', ['uploadFile']);
    mockDocumentManagementService.uploadFile.and.returnValues(
      of(RESPONSE_FIRST_DOCUMENT_MANDATORY),
      of(RESPONSE_SECOND_DOCUMENT_MANDATORY)
    );
    dialog = createSpyObj<MatDialog>('dialog', ['open']);
    matDialogRef = createSpyObj<MatDialogRef<DocumentDialogComponent>>('matDialogRef', ['close']);

    mockFileUploadStateService = createSpyObj<FileUploadStateService>('fileUploadStateService', [
      'setUploadInProgress',
      'isUploadInProgress'
    ]);

    TestBed
      .configureTestingModule({
        imports: [],
        declarations: [
          WriteDocumentFieldComponent,
          FieldLabelPipe,
          DocumentDialogComponent,
          // Mock
          ReadDocumentComponent,
        ],
        providers: [
          {provide: DocumentManagementService, useValue: mockDocumentManagementService},
          {provide: MatDialog, useValue: dialog},
          {provide: MatDialogRef, useValue: matDialogRef},
          {provide: MatDialogConfig, useValue: DIALOG_CONFIG},
          {provide: FileUploadStateService, useValue: mockFileUploadStateService},
          DocumentDialogComponent
        ]
      })
      .compileComponents();

    fixture = TestBed.createComponent(WriteDocumentFieldComponent);
    component = fixture.componentInstance;

    component.registerControl = REGISTER_CONTROL;
    component.caseField = CASE_FIELD_MANDATORY;

    de = fixture.debugElement;
    fixture.detectChanges();
  });

  it('should be invalid if no document specified for upload for read only. Empty file.', () => {
    component.caseField = CASE_FIELD_MANDATORY;
    component.ngOnInit();
    expect(component.caseField.value).toBeTruthy();

    component.fileChangeEvent({
      target: {
        files: []
      }
    });
    expect(component.valid).toBeFalsy();
    expect(component.fileUploadMessages).toEqual('File required');
  });

  it('should be valid if no document specified for upload for not read only. Empty file.', () => {
    // Initialization.
    component.valid = true;
    component.caseField = CASE_FIELD;
    component.ngOnInit();
    expect(component.caseField.value).toBeTruthy();
    expect(component.valid).toBeTruthy();

    component.fileChangeEvent({
      target: {
        files: []
      }
    });
    expect(component.valid).toBeTruthy();
  });

  it('should cancel file upload', () => {
    component.fileUploadSubscription = new Subscription();
    const fileUploadSubscriptionSpy = spyOn(component.fileUploadSubscription, 'unsubscribe');
    component.cancelUpload();

    expect(fileUploadSubscriptionSpy).toHaveBeenCalled();
    expect(mockFileUploadStateService.setUploadInProgress).toHaveBeenCalledWith(false);

  });
});
