import { DebugElement } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { FormGroup, FormControl } from '@angular/forms';
import { MatDialogConfig } from '@angular/material/dialog';
import { MatLegacyDialog as MatDialog, MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { By } from '@angular/platform-browser';
import { MockComponent } from 'ng2-mock-component';
import { BehaviorSubject, Subscription, of, throwError } from 'rxjs';
import { AbstractAppConfig } from '../../../../app.config';
import { CaseField, DocumentData, FieldType, HttpError, Jurisdiction } from '../../../domain';
import { DocumentManagementService, JurisdictionService } from '../../../services';
import { MockFieldLabelPipe } from '../../../test/mock-field-label.pipe';
import { MockRpxTranslatePipe } from '../../../test/mock-rpx-translate.pipe';
import { CaseNotifier, CasesService, EventTriggerService } from '../../case-editor';
import { DocumentDialogComponent } from '../../dialogs';
import { FieldLabelPipe } from '../utils';
import { FileUploadStateService } from './file-upload-state.service';
import { WriteDocumentFieldComponent } from './write-document-field.component';

import createSpyObj = jasmine.createSpyObj;
import any = jasmine.any;
import { HttpErrorResponse } from '@angular/common/http';
import { mock } from 'node:test';

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
          href: `${DOCUMENT_MANAGEMENT_URL}/abcd0123`
        },
        binary: {
          href: `${DOCUMENT_MANAGEMENT_URL}/abcd0123/binary`
        }
      }
    }]
  },
  documents: [{
    originalDocumentName: 'howto.pdf',
    _links: {
      self: {
        href: `${DOCUMENT_MANAGEMENT_URL}/abcd0123`
      },
      binary: {
        href: `${DOCUMENT_MANAGEMENT_URL}/abcd0123/binary`
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
          href: `${DOCUMENT_MANAGEMENT_URL}/cdef4567`
        },
        binary: {
          href: `${DOCUMENT_MANAGEMENT_URL}/cdef4567/binary`
        }
      }
    }]
  },
  documents: [{
    originalDocumentName: 'plop.pdf',
    _links: {
      self: {
        href: `${DOCUMENT_MANAGEMENT_URL}/cdef4567`
      },
      binary: {
        href: `${DOCUMENT_MANAGEMENT_URL}/cdef4567/binary`
      }
    }
  }]
};

describe('WriteDocumentFieldComponent', () => {

  const FORM_GROUP = new FormGroup({});
  const DIALOG_CONFIG = new MatDialogConfig();
  const $DIALOG_REPLACE_BUTTON = By.css('.button[title=Replace]');
  const $DIALOG_CANCEL_BUTTON = By.css('.button[title=Cancel]');

  const readDocumentComponentMock = MockComponent({
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
  let casesService: any;

  let jurisdictionService: any;
  const eventTriggerService: any = {};
  let caseNotifier: any;

  beforeEach(waitForAsync(() => {
    mockDocumentManagementService = createSpyObj<DocumentManagementService>('documentManagementService', ['uploadFile', 'isDocumentSecureModeEnabled']);
    mockDocumentManagementService.uploadFile.and.returnValues(
      of(RESPONSE_FIRST_DOCUMENT),
      of(RESPONSE_SECOND_DOCUMENT)
    );
    mockDialog = createSpyObj<MatDialog>('dialog', ['open']);
    mockMatDialogRef = createSpyObj<MatDialogRef<DocumentDialogComponent>>('matDialogRef', ['beforeClosed', 'close']);
    casesService = createSpyObj('casesService', ['getCaseViewV2']);
    mockFileUploadStateService = createSpyObj<FileUploadStateService>('fileUploadStateService', [
      'setUploadInProgress',
      'isUploadInProgress'
    ]);

    appConfig = createSpyObj('AbstractAppConfig', ['getCdamExclusionList', 'logMessage']);
    mockDocumentManagementService.isDocumentSecureModeEnabled.and.returnValue(true);
    caseNotifier = {};
    caseNotifier.caseView = of({ case_type: { id: 'test' } });
    jurisdictionService = createSpyObj<JurisdictionService>('jurisdictionService', ['getSelectedJurisdiction']);
    jurisdictionService.getSelectedJurisdiction.and.returnValue(of({ id: 'test-jurisdiction' }));
    TestBed
      .configureTestingModule({
        imports: [],
        declarations: [
          WriteDocumentFieldComponent,
          FieldLabelPipe,
          DocumentDialogComponent,
          // Mocks
          readDocumentComponentMock,
          MockRpxTranslatePipe,
          MockFieldLabelPipe
        ],
        providers: [
          { provide: DocumentManagementService, useValue: mockDocumentManagementService },
          { provide: MatDialog, useValue: mockDialog },
          { provide: MatDialogRef, useValue: mockMatDialogRef },
          { provide: MatDialogConfig, useValue: DIALOG_CONFIG },
          { provide: FileUploadStateService, useValue: mockFileUploadStateService },
          { provide: AbstractAppConfig, useValue: appConfig },
          { provide: CasesService, useValue: casesService },
          { provide: JurisdictionService, useValue: jurisdictionService },
          { provide: EventTriggerService, useValue: eventTriggerService },
          { provide: CaseNotifier, useValue: caseNotifier },
          DocumentDialogComponent
        ]
      })
      .compileComponents();

    fixture = TestBed.createComponent(WriteDocumentFieldComponent);
    component = fixture.componentInstance;

    component.caseField = CASE_FIELD;
    component.formGroup = FORM_GROUP;

    de = fixture.debugElement;
    component.ngOnInit();
    fixture.detectChanges();
  }));

  it('should be valid for the initial component state.', () => {
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
    expect(component.triggerReplace()).toBeTruthy();
  });

  it('should open replace file dialog if document exist', () => {
    const spyOpenFileDialog = spyOn(component, 'openFileDialog');
    component.caseField.value = {};
    component.caseField.value.document_filename = 'file_name_1';
    mockMatDialogRef = {
      beforeClosed() {
        return of('Replace');
      },
      close(r: any) {
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
      },
      close(r: any) {
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
              href: `${DOCUMENT_MANAGEMENT_URL}/abcd0123`
            },
            binary: {
              href: `${DOCUMENT_MANAGEMENT_URL}/abcd0123/binary`
            }
          }
        }]
      },
      documents: [{
        originalDocumentName: 'test.pdf',
        _links: {
          self: {
            href: `${DOCUMENT_MANAGEMENT_URL}/abcd0123`
          },
          binary: {
            href: `${DOCUMENT_MANAGEMENT_URL}/abcd0123/binary`
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
    const file: File = new File(blobParts, 'test.foo');
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

  it('should get error message', () => {
    const error = new HttpError();
    error.error = 'Unknown error';
    error.status = 422;
    const errorMsgSpy = spyOn<any>(component, 'getErrorMessage');
    component['handleDocumentUploadError'](error);;

    expect(errorMsgSpy).toHaveBeenCalledWith(error);
  });

  it('should call fileValidationsOnTab', () => {
    const fileValidationsOnTabSpy = spyOn<any>(component, 'fileValidationsOnTab').and.callThrough();
    component['fileValidationsOnTab']();
    expect(fileValidationsOnTabSpy).toHaveBeenCalled();
  });


  it('should cover the 429 status code', () => {
    let errorMsg = WriteDocumentFieldComponent.UPLOAD_ERROR_NOT_AVAILABLE;
    const status = {
      status: 429,
      error: 'Unknown error'
    } as HttpError

    component['handleDocumentUploadError'](status);
    fixture.detectChanges();

    expect(errorMsg).toEqual(WriteDocumentFieldComponent.UPLOAD_ERROR_NOT_AVAILABLE);
  });

  it('should cover the 422 status code', () => {
    let errorMsg = WriteDocumentFieldComponent.UPLOAD_ERROR_NOT_AVAILABLE;
    const status = {
      status: 422,
      error: 'Unknown error'
    } as HttpError

    component['handleDocumentUploadError'](status);
    fixture.detectChanges();

    expect(errorMsg).toEqual(WriteDocumentFieldComponent.UPLOAD_ERROR_NOT_AVAILABLE);
  });

  it('should cover the 502 status code', () => {
    let errorMsg = WriteDocumentFieldComponent.UPLOAD_ERROR_NOT_AVAILABLE;
    const status = {
      status: 502,
      error: 'Unknown error'
    } as HttpError

    component['handleDocumentUploadError'](status);
    fixture.detectChanges();

    expect(errorMsg).toEqual(errorMsg);
  });

  describe('getErrorMessage', () => {
    it('should return UPLOAD_ERROR_NOT_AVAILABLE for status 0', () => {
      const error = { status: 0 } as any;
      expect(component['getErrorMessage'](error)).toBe(WriteDocumentFieldComponent.UPLOAD_ERROR_NOT_AVAILABLE);
    });

    it('should return UPLOAD_ERROR_NOT_AVAILABLE for status 502', () => {
      const error = { status: 502 } as any;
      expect(component['getErrorMessage'](error)).toBe(WriteDocumentFieldComponent.UPLOAD_ERROR_NOT_AVAILABLE);
    });

    it('should return extracted secure error message for status 422 and secure mode', () => {
      component.fileSecureModeOn = true;
      const error = {
        status: 422,
        error: '{"error":"Secure error"} <'
      } as any;
      expect(component['getErrorMessage'](error)).toBe('Secure error');
    });

    it('should return fallback error if secure error cannot be extracted', () => {
      component.fileSecureModeOn = true;
      const error = {
        status: 422,
        error: 'Not a JSON'
      } as any;
      expect(component['getErrorMessage'](error)).toBe(WriteDocumentFieldComponent.ERROR_UPLOADING_FILE);
    });

    it('should return error.error for status 422 and not secure mode', () => {
      component.fileSecureModeOn = false;
      const error = {
        status: 422,
        error: 'Normal error'
      } as any;
      expect(component['getErrorMessage'](error)).toBe('Normal error');
    });

    it('should return error.error for status 429', () => {
      const error = {
        status: 429,
        error: 'Too many requests'
      } as any;
      expect(component['getErrorMessage'](error)).toBe('Too many requests');
    });

    it('should return ERROR_UPLOADING_FILE for other status', () => {
      const error = { status: 404 } as any;
      expect(component['getErrorMessage'](error)).toBe(WriteDocumentFieldComponent.ERROR_UPLOADING_FILE);
    });
  });

  describe('extractSecureErrorMessage', () => {
    it('should return parsed error from JSON', () => {
      const error = {
        error: '{"error":"Secure error"}<'
      } as any;
      expect(component['extractSecureErrorMessage'](error)).toBe('Secure error');
    });
  });

  it('should call isUploadAFile', () => {
    component.fileUploadMessages = undefined;
    const result = component['isUpLoadingAFile']();
    fixture.detectChanges();

    expect(result).toBeFalsy();
  });

  it('should not allow a user to change the allowed files to upload', () => {
    const allowedFileTypes = '.pdf,.txt,.doc,.dot,.docx,.rtf,.xls,.xlt,.xla,.xlsx,.xltx,.xlsb,.ppt,.pot,.pps,.ppa,.pptx,.potx,.ppsx,.jpg,.jpeg,.bmp,.tif,.tiff,.png,.csv';
    const blobParts: BlobPart[] = ['some contents for blob'];
    const file: File = new File(blobParts, 'test.mp3');
    const dummyEvent = {
      target: {
        files: [
          file
        ]
      }
    };
    component.fileChangeEvent(dummyEvent, allowedFileTypes);
    expect(component.fileUploadMessages).toEqual('Document format is not supported');
  });

  it('should allow user to upload file ignoring file extension case', () => {
    const allowedFileTypes = '.pdf,.txt,.doc,.dot,.docx,.rtf,.xls,.xlt,.xla,.xlsx,.xltx,.xlsb,.ppt,.pot,.pps,.ppa,.pptx,.potx,.ppsx,.jpg,.jpeg,.bmp,.tif,.tiff,.png,.csv';
    const blobParts: BlobPart[] = ['some contents for blob'];
    const file: File = new File(blobParts, 'test.PDF');
    const dummyEvent = {
      target: {
        files: [
          file
        ]
      }
    };
    component.fileChangeEvent(dummyEvent, allowedFileTypes);
    expect(component.fileUploadMessages).toEqual('Uploading...');
  });

  it('should allow user to upload if there is no file types specified', () => {
    spyOn(component, 'invalidFileFormat');
    const allowedFileTypes = '';
    const blobParts: BlobPart[] = ['some contents for blob'];
    const file: File = new File(blobParts, 'test.mp3');
    const dummyEvent = {
      target: {
        files: [
          file
        ]
      }
    };
    component.fileChangeEvent(dummyEvent, allowedFileTypes);
    expect(component.invalidFileFormat).not.toHaveBeenCalled();
  });

  it('should not break if allowedFileTypes is undefined', () => {
    spyOn(component, 'invalidFileFormat');
    const allowedFileTypes = undefined;
    const blobParts: BlobPart[] = ['some contents for blob'];
    const file: File = new File(blobParts, 'test.mp3');
    const dummyEvent = {
      target: {
        files: [
          file
        ]
      }
    };
    component.fileChangeEvent(dummyEvent, allowedFileTypes);
    expect(component.invalidFileFormat).not.toHaveBeenCalled();
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
            href: `${DOCUMENT_MANAGEMENT_URL_MANDATORY}/abcd0123`
          },
          binary: {
            href: `${DOCUMENT_MANAGEMENT_URL_MANDATORY}/abcd0123/binary`
          }
        }
      }]
    },
    documents: [{
      originalDocumentName: 'howto.pdf',
      _links: {
        self: {
          href: `${DOCUMENT_MANAGEMENT_URL_MANDATORY}/abcd0123`
        },
        binary: {
          href: `${DOCUMENT_MANAGEMENT_URL_MANDATORY}/abcd0123/binary`
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
            href: `${DOCUMENT_MANAGEMENT_URL_MANDATORY}/cdef4567`
          },
          binary: {
            href: `${DOCUMENT_MANAGEMENT_URL_MANDATORY}/cdef4567/binary`
          }
        }
      }]
    },
    documents: [{
      originalDocumentName: 'plop.pdf',
      _links: {
        self: {
          href: `${DOCUMENT_MANAGEMENT_URL_MANDATORY}/cdef4567`
        },
        binary: {
          href: `${DOCUMENT_MANAGEMENT_URL_MANDATORY}/cdef4567/binary`
        }
      }
    }]
  };
  const DIALOG_CONFIG = new MatDialogConfig();

  const readDocumentComponentMock = MockComponent({
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
  let casesService: any;
  let jurisdictionService: any;
  let caseNotifier: any;
  const eventTriggerService: any = {};

  beforeEach(waitForAsync(() => {

    mockDocumentManagementService = createSpyObj<DocumentManagementService>('documentManagementService', ['uploadFile', 'isDocumentSecureModeEnabled']);
    mockDocumentManagementService.uploadFile.and.returnValues(
      of(RESPONSE_FIRST_DOCUMENT_MANDATORY),
      of(RESPONSE_SECOND_DOCUMENT_MANDATORY)
    );
    dialog = createSpyObj<MatDialog>('dialog', ['open']);
    matDialogRef = createSpyObj<MatDialogRef<DocumentDialogComponent>>('matDialogRef', ['close']);
    casesService = createSpyObj('casesService', ['getCaseViewV2']);
    mockFileUploadStateService = createSpyObj<FileUploadStateService>('fileUploadStateService', [
      'setUploadInProgress',
      'isUploadInProgress'
    ]);

    appConfig = createSpyObj('AbstractAppConfig', ['getCdamExclusionList', 'logMessage']);
    mockDocumentManagementService.isDocumentSecureModeEnabled.and.returnValue(true);
    caseNotifier = {};
    caseNotifier.caseView = of({ case_type: { id: 'test' } });
    jurisdictionService = createSpyObj<JurisdictionService>('jurisdictionService', ['getSelectedJurisdiction']);
    jurisdictionService.getSelectedJurisdiction.and.returnValue(of({ id: 'test-jurisdiction' }));
    TestBed
      .configureTestingModule({
        imports: [],
        declarations: [
          WriteDocumentFieldComponent,
          FieldLabelPipe,
          DocumentDialogComponent,
          // Mocks
          readDocumentComponentMock,
          MockRpxTranslatePipe,
          MockFieldLabelPipe
        ],
        providers: [
          { provide: DocumentManagementService, useValue: mockDocumentManagementService },
          { provide: MatDialog, useValue: dialog },
          { provide: MatDialogRef, useValue: matDialogRef },
          { provide: MatDialogConfig, useValue: DIALOG_CONFIG },
          { provide: FileUploadStateService, useValue: mockFileUploadStateService },
          { provide: AbstractAppConfig, useValue: appConfig },
          { provide: CasesService, useValue: casesService },
          { provide: JurisdictionService, useValue: jurisdictionService },
          { provide: EventTriggerService, useValue: eventTriggerService },
          { provide: CaseNotifier, useValue: caseNotifier },
          DocumentDialogComponent
        ]
      })
      .compileComponents();

    fixture = TestBed.createComponent(WriteDocumentFieldComponent);
    component = fixture.componentInstance;

    component.caseField = CASE_FIELD_MANDATORY;

    de = fixture.debugElement;
    fixture.detectChanges();
  }));

  it('should set jurisdiction and casetype from casenotifier', () => {
    component.caseField = CASE_FIELD_MANDATORY;
    caseNotifier.caseView = of({ case_type: { id: 'test1', jurisdiction: { id: 'test2' } } });
    jurisdictionService.getSelectedJurisdiction.and.returnValue(of(undefined));
    component.ngOnInit();
    expect(component.caseTypeId).toBe('test1');
    expect(component.jurisdictionId).toBe('test2');
  });

  it('should set jurisdiction and casetype from casenotifier', () => {
    component.caseField = CASE_FIELD_MANDATORY;
    caseNotifier.caseView = of(undefined);
    jurisdictionService.getSelectedJurisdiction.and.returnValue(of({
      id: 'test1',
      currentCaseType: {
        id: 'test2'
      }
    }));
    component.ngOnInit();
    expect(component.caseTypeId).toBe('test2');
    expect(component.jurisdictionId).toBe('test1');
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

  it('should be logged as enabled if file is securemode', () => {
    const blobParts: BlobPart[] = ['some contents for blob'];
    const file: File = new File(blobParts, 'test.pdf');
    mockDocumentManagementService.isDocumentSecureModeEnabled.and.returnValue(true);
    caseNotifier.caseView = of({ case_id: '12345', case_type: { id: 'test', jurisdiction: { id: 'test-jurisdiction' } } });
    component.ngOnInit();
    expect(component.caseField.value).toBeTruthy();
    component.fileChangeEvent({
      target: {
        files: [
          file
        ]
      }
    });
    expect(mockFileUploadStateService.setUploadInProgress).toHaveBeenCalledWith(true);
    expect(mockDocumentManagementService.uploadFile).toHaveBeenCalledWith(any(FormData));
    expect(appConfig.logMessage).toHaveBeenCalledWith('CDAM is enabled for case with case ref:: 12345');
  });

  it('should be logged as disabled if file is NOT securemode', () => {
    const blobParts: BlobPart[] = ['some contents for blob'];
    const file: File = new File(blobParts, 'test.pdf');
    mockDocumentManagementService.isDocumentSecureModeEnabled.and.returnValue(false);
    caseNotifier.caseView = of({ case_id: '12345', case_type: { id: 'test', jurisdiction: { id: 'test-jurisdiction' } } });
    component.ngOnInit();
    component.fileChangeEvent({
      target: {
        files: [
          file
        ]
      }
    });
    expect(appConfig.logMessage).toHaveBeenCalledWith('CDAM is disabled for case with case ref:: 12345');
  });

  it('should set caseId from caseNotifier', () => {
    component.caseField = CASE_FIELD_MANDATORY;
    mockDocumentManagementService.isDocumentSecureModeEnabled.and.returnValue(false);
    caseNotifier.caseView = of({ case_id: '12345', case_type: { id: 'test', jurisdiction: { id: 'test-jurisdiction' } } });
    component.ngOnInit();
    expect(component.caseField.value).toBeTruthy();

    component.fileChangeEvent({
      target: {
        files: []
      }
    });
    expect(component.caseId).toBe('12345');
  });

  it('should cancel file upload', () => {
    component.fileUploadSubscription = new Subscription();
    const fileUploadSubscriptionSpy = spyOn(component.fileUploadSubscription, 'unsubscribe');
    component.cancelUpload();

    expect(fileUploadSubscriptionSpy).toHaveBeenCalled();
    expect(mockFileUploadStateService.setUploadInProgress).toHaveBeenCalledWith(false);

  });

  it('createDocumentForm - should add upload_timestamp control to form group if document.upload_timestamp is string', () => {
    // Mock document with upload_timestamp as string
    const document = {
      document_filename: 'Beers encyclopedia',
      document_binary_url: '/test/binary',
      document_url: '/test',
      attribute_path: '',
      upload_timestamp: '14 Apr 2023 00:00:00'
    };

    // Create a new form group
    const initialFormGroup = new FormGroup({
      document_url: new FormControl(),
      document_binary_url: new FormControl(),
      document_filename: new FormControl()
    });

    // Call the private method to test
    component['createDocumentForm'](document);

    expect(initialFormGroup.get('upload_timestamp')).toBeNull('upload_timestamp control should not exist before createDocumentForm is called');

    expect(component['uploadedDocument'].get('upload_timestamp') instanceof FormControl).toBe(true);
    expect(component['uploadedDocument'].get('upload_timestamp').value).toEqual(document.upload_timestamp);
  });

  it('createDocumentFormWithValidator - should add upload_timestamp control to form group if document.upload_timestamp is string', () => {
    // Mock document with upload_timestamp as string
    const document = {
      document_filename: 'Beers encyclopedia',
      document_binary_url: '/test/binary',
      document_url: '/test',
      attribute_path: '',
      upload_timestamp: '14 Apr 2023 00:00:00'
    };

    // Create a new form group
    const initialFormGroup = new FormGroup({
      document_url: new FormControl(),
      document_binary_url: new FormControl(),
      document_filename: new FormControl()
    });

    // Call the private method to test
    component['createDocumentFormWithValidator'](document);

    expect(initialFormGroup.get('upload_timestamp')).toBeNull('upload_timestamp control should not exist before createDocumentForm is called');

    expect(component['uploadedDocument'].get('upload_timestamp') instanceof FormControl).toBe(true);
    expect(component['uploadedDocument'].get('upload_timestamp').value).toEqual(document.upload_timestamp);
  });

  it('should update form controls in uploadedDocument and remove UPLOAD_TIMESTAMP control', () => {
    // Initialize uploadedDocument with some initial values
    component['uploadedDocument'] = new FormGroup({
      document_url: new FormControl('initial_url'),
      document_binary_url: new FormControl('initial_binary_url'),
      document_filename: new FormControl('initial_filename'),
      document_hash: new FormControl('initial_document_hash'),
      [WriteDocumentFieldComponent.UPLOAD_TIMESTAMP]: new FormControl('initial_timestamp')
    });

    // Call the method to test
    component['updateDocumentForm']('new_url', 'new_binary_url', 'new_filename', 'new_document_hash');

    // Expect the form controls to be updated with new values
    expect(component['uploadedDocument'].get(WriteDocumentFieldComponent.DOCUMENT_URL).value).toEqual('new_url');
    expect(component['uploadedDocument'].get(WriteDocumentFieldComponent.DOCUMENT_BINARY_URL).value).toEqual('new_binary_url');
    expect(component['uploadedDocument'].get(WriteDocumentFieldComponent.DOCUMENT_FILENAME).value).toEqual('new_filename');
    expect(component['uploadedDocument'].get(WriteDocumentFieldComponent.DOCUMENT_HASH).value).toEqual('new_document_hash');

    // Expect the UPLOAD_TIMESTAMP control to be removed
    expect(component['uploadedDocument'].get(WriteDocumentFieldComponent.UPLOAD_TIMESTAMP)).toBeNull('UPLOAD_TIMESTAMP control should be removed');
  });
});

describe('WriteDocumentFieldComponent', () => {

  const FORM_GROUP = new FormGroup({});
  const DIALOG_CONFIG = new MatDialogConfig();
  const $DIALOG_REPLACE_BUTTON = By.css('.button[title=Replace]');
  const $DIALOG_CANCEL_BUTTON = By.css('.button[title=Cancel]');

  const readDocumentComponentMock = MockComponent({
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
  let casesService: any;

  let jurisdictionService: any;
  const eventTriggerService: any = {};
  let caseNotifier: any;

  beforeEach(waitForAsync(() => {
    mockDocumentManagementService = createSpyObj<DocumentManagementService>('documentManagementService', ['uploadFile', 'isDocumentSecureModeEnabled']);
    mockDocumentManagementService.uploadFile.and.returnValues(
      of(RESPONSE_FIRST_DOCUMENT),
      of(RESPONSE_SECOND_DOCUMENT)
    );
    mockDialog = createSpyObj<MatDialog>('dialog', ['open']);
    mockMatDialogRef = createSpyObj<MatDialogRef<DocumentDialogComponent>>('matDialogRef', ['beforeClosed', 'close']);
    casesService = createSpyObj('casesService', ['getCaseViewV2']);
    mockFileUploadStateService = createSpyObj<FileUploadStateService>('fileUploadStateService', [
      'setUploadInProgress',
      'isUploadInProgress'
    ]);

    appConfig = createSpyObj('AbstractAppConfig', ['getCdamExclusionList', 'logMessage']);
    mockDocumentManagementService.isDocumentSecureModeEnabled.and.returnValue(true);
    caseNotifier = {};
    caseNotifier.caseView = of(undefined);
    jurisdictionService = createSpyObj<JurisdictionService>('jurisdictionService', ['getSelectedJurisdiction']);
    jurisdictionService.getSelectedJurisdiction.and.returnValue(of(undefined));
    TestBed
      .configureTestingModule({
        imports: [],
        declarations: [
          WriteDocumentFieldComponent,
          FieldLabelPipe,
          DocumentDialogComponent,
          // Mocks
          readDocumentComponentMock,
          MockRpxTranslatePipe,
          MockFieldLabelPipe
        ],
        providers: [
          { provide: DocumentManagementService, useValue: mockDocumentManagementService },
          { provide: MatDialog, useValue: mockDialog },
          { provide: MatDialogRef, useValue: mockMatDialogRef },
          { provide: MatDialogConfig, useValue: DIALOG_CONFIG },
          { provide: FileUploadStateService, useValue: mockFileUploadStateService },
          { provide: AbstractAppConfig, useValue: appConfig },
          { provide: CasesService, useValue: casesService },
          { provide: JurisdictionService, useValue: jurisdictionService },
          { provide: EventTriggerService, useValue: eventTriggerService },
          { provide: CaseNotifier, useValue: caseNotifier },
          DocumentDialogComponent
        ]
      })
      .compileComponents();

    fixture = TestBed.createComponent(WriteDocumentFieldComponent);
    component = fixture.componentInstance;

    component.caseField = CASE_FIELD;
    component.formGroup = FORM_GROUP;

    de = fixture.debugElement;
    component.ngOnInit();
    fixture.detectChanges();
  }));

  it('should set jurisdiction and casetype from casenotifier', () => {
    caseNotifier.caseView = of(undefined); // mock expected structure
    jurisdictionService = createSpyObj<JurisdictionService>('jurisdictionService', ['getSelectedJurisdiction']);
    jurisdictionService.getSelectedJurisdiction.and.returnValue(of(undefined));
    window.history.pushState({}, '', '/case/case-create/test1/test2');
    component.ngOnInit();
    expect(component.caseTypeId).toBe('test2');
    expect(component.jurisdictionId).toBe('test1');
  });
});
