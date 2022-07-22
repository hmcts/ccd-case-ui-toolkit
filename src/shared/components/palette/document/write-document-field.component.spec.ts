import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup } from '@angular/forms';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import { MockComponent } from 'ng2-mock-component';
import { of, Subscription, throwError } from 'rxjs';
import { AbstractAppConfig } from '../../../../app.config';
import { CaseField, FieldType } from '../../../domain/definition';
import { DocumentData } from '../../../domain/document';
import { DocumentManagementService } from '../../../services/document-management';
import { CaseNotifier } from '../../case-editor';
import { DocumentDialogComponent } from '../../dialogs/document-dialog';
import { FieldLabelPipe } from '../utils';
import createSpyObj = jasmine.createSpyObj;
import any = jasmine.any;
import { FileUploadStateService } from './file-upload-state.service';
import { WriteDocumentFieldComponent } from './write-document-field.component';

const FIELD_TYPE: FieldType = {
  id: 'Document',
  type: 'Document'
};
const VALUE = {
  document_url: 'https://www.example.com',
  document_binary_url: 'https://www.example.com/binary',
  document_filename: 'evidence_document.evd'
};
const CASE_FIELD: CaseField = ({
  id: 'x',
  label: 'X',
  display_context: 'OPTIONAL',
  field_type: FIELD_TYPE,
  value: VALUE
}) as CaseField;

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
  },
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
  },
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
};

describe('WriteDocumentFieldComponent', () => {

  const FORM_GROUP_ID = 'document_url';
  const FORM_GROUP = new FormGroup({});
  const DIALOG_CONFIG = new MatDialogConfig();
  const $DIALOG_REPLACE_BUTTON = By.css('.button[title=Replace]');
  const $DIALOG_CANCEL_BUTTON = By.css('.button[title=Cancel]');

  const ReadDocumentComponent = MockComponent({
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
  let mockDialog: any;
  let mockMatDialogRef: any;
  let appConfig: any;

  beforeEach(() => {
    mockDocumentManagementService = createSpyObj<DocumentManagementService>('documentManagementService', ['uploadFile']);
    mockDocumentManagementService.uploadFile.and.returnValues(
      of(RESPONSE_FIRST_DOCUMENT),
      of(RESPONSE_SECOND_DOCUMENT)
    );
    mockDialog = createSpyObj<MatDialog>('dialog', ['open']);
    mockMatDialogRef = createSpyObj<MatDialogRef<DocumentDialogComponent>>('matDialogRef', ['beforeClosed']);

    mockFileUploadStateService = createSpyObj<FileUploadStateService>('fileUploadStateService', [
      'setUploadInProgress',
      'isUploadInProgress'
    ]);

    appConfig = createSpyObj('AbstractAppConfig', ['getDocumentSecureMode']);

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
          {provide: MatDialog, useValue: mockDialog},
          {provide: MatDialogRef, useValue: mockMatDialogRef},
          {provide: MatDialogConfig, useValue: DIALOG_CONFIG},
          {provide: FileUploadStateService, useValue: mockFileUploadStateService},
          {provide: AbstractAppConfig, useValue: appConfig },
          DocumentDialogComponent,
          CaseNotifier
        ]
      })
      .compileComponents();

    fixture = TestBed.createComponent(WriteDocumentFieldComponent);
    component = fixture.componentInstance;

    component.caseField = CASE_FIELD;
    component.formGroup = FORM_GROUP;

    de = fixture.debugElement;
    fixture.detectChanges();
  });

  it('should be valid for the initial component state.', () => {
    console.log('component.caseField', component.caseField);
    expect(component.valid).toBeTruthy();
  });

  it('should render an element for file selection', () => {
    const uploadElement = de.query(By.css('input[type=file]'));

    expect(uploadElement).toBeTruthy();
  });

  it('should render a ccd-read-document-field tag for an existing document', () => {
    const ccdReadDocumentElement = de.query(By.css('ccd-read-document-field'));

    expect(ccdReadDocumentElement).toBeTruthy();
  });

  it('should initialise formControl with provided value', () => {
    expect(FORM_GROUP.controls[CASE_FIELD.id].value.document_url).toBe(VALUE.document_url);
    expect(FORM_GROUP.controls[CASE_FIELD.id].value.document_binary_url).toBe(VALUE.document_binary_url);
    expect(FORM_GROUP.controls[CASE_FIELD.id].value.document_filename).toBe(VALUE.document_filename);
  });

  it('should open file dialog if document does not exist', () => {
    component.caseField.value = null;
    expect(component.caseField.value).toBeFalsy();
    component.fileSelectEvent();
    component.confirmReplaceResult = 'Replace';
    expect(component.triggerReplace()).toBeFalsy();
  });

  it('should open replace file dialog if document exist', () => {
    const spyOpenFileDialog = spyOn(component, 'openFileDialog');
    component.caseField.value = {};
    component.caseField.value.document_filename = 'file_name_1';
    mockMatDialogRef = {
      beforeClosed() {
        return of('Replace');
      }
    };
    mockDialog.open.and.returnValue(mockMatDialogRef);
    component.dialog = mockDialog;
    component.fileSelectEvent();
    expect(component.confirmReplaceResult).toBe('Replace');
    expect(spyOpenFileDialog).toHaveBeenCalled();
  });

  it('should open replace file dialog if has selected document', () => {
    const spyOpenFileDialog = spyOn(component, 'openFileDialog');
    component.selectedFile = new File(['foo'], 'file_name_2.txt');
    mockMatDialogRef = {
      beforeClosed() {
        return of('Replace');
      }
    };
    mockDialog.open.and.returnValue(mockMatDialogRef);
    component.dialog = mockDialog;
    component.fileSelectEvent();
    expect(component.confirmReplaceResult).toBe('Replace');
    expect(spyOpenFileDialog).toHaveBeenCalled();
  });

  it('should replace upload given document', () => {
    const REPLACE_DOCUMENT: DocumentData = {
      _embedded: {
        documents: [{
          originalDocumentName: 'test.pdf',
          _links: {
            self: {
              href: DOCUMENT_MANAGEMENT_URL + '/abcd0123'
            },
            binary: {
              href: DOCUMENT_MANAGEMENT_URL + '/abcd0123/binary'
            }
          }
        }]
      },
      documents: [{
        originalDocumentName: 'test.pdf',
        _links: {
          self: {
            href: DOCUMENT_MANAGEMENT_URL + '/abcd0123'
          },
          binary: {
            href: DOCUMENT_MANAGEMENT_URL + '/abcd0123/binary'
          }
        }
      }]
    };
    mockDocumentManagementService.uploadFile.and.returnValue(of(REPLACE_DOCUMENT));
    const blobParts: BlobPart[] = ['some contents for blob'];
    const file: File = new File(blobParts, 'test.pdf');
    component.fileChangeEvent({
      target: {
        files: [
          file
        ]
      }
    });
    expect(component.caseField.value.document_filename).toBe('test.pdf');
  });

  it('should upload given document', () => {
    const blobParts: BlobPart[] = ['some contents for blob'];
    const file: File = new File(blobParts, 'test.pdf');
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

    const blobParts: BlobPart[] = ['some contents for blob'];
    const file: File = new File(blobParts, 'test.pdf');
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
    const replaceElement = deDialog.query(By.css('.button[title=Replace]'));
    expect(replaceElement).toBeTruthy();
  });

  it('should trigger the document replace event when replace button is clicked', () => {
    fixtureDialog = TestBed.createComponent(DocumentDialogComponent);
    componentDialog = fixtureDialog.componentInstance;
    deDialog = fixtureDialog.debugElement;
    fixtureDialog.detectChanges();

    const dialogReplacelButton = deDialog.query($DIALOG_REPLACE_BUTTON);
    dialogReplacelButton.nativeElement.click();
    expect(componentDialog.result).toEqual('Replace');
    fixture.detectChanges();
  });

  it('should not trigger the document replace event when cancel button is clicked', () => {
    fixtureDialog = TestBed.createComponent(DocumentDialogComponent);
    componentDialog = fixtureDialog.componentInstance;
    deDialog = fixtureDialog.debugElement;
    fixtureDialog.detectChanges();
    const dialogCancelButton = deDialog.query($DIALOG_CANCEL_BUTTON);
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
    component.caseField = (({
      id: 'x',
      label: 'X',
      field_type: FIELD_TYPE_WITH_REGEX,
      value: VALUE
    }) as CaseField);

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
    document_url: 'https://www.example.com',
    document_binary_url: 'https://www.example.com/binary',
    document_filename: 'evidence_document.evd'
  };

  const CASE_FIELD_MANDATORY: CaseField = ({
    id: 'x',
    label: 'X',
    display_context: 'MANDATORY',
    field_type: FIELD_TYPE_MANDATORY,
    value: VALUE_MANDATORY
  }) as CaseField;
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
    },
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
    },
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
  };
  const DIALOG_CONFIG = new MatDialogConfig();

  const ReadDocumentComponent = MockComponent({
    selector: 'ccd-read-document-field',
    inputs: ['caseField']
  });

  let fixture: ComponentFixture<WriteDocumentFieldComponent>;
  let component: WriteDocumentFieldComponent;
  let de: DebugElement;
  let mockDocumentManagementService: any;
  let mockFileUploadStateService: any;
  let appConfig;

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

    appConfig = createSpyObj('AbstractAppConfig', ['getDocumentSecureMode']);

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
          {provide: AbstractAppConfig, useValue: appConfig},
          DocumentDialogComponent,
          CaseNotifier
        ]
      })
      .compileComponents();

    fixture = TestBed.createComponent(WriteDocumentFieldComponent);
    component = fixture.componentInstance;

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
