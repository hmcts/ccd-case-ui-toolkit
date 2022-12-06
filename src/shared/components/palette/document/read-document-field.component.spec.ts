import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReadDocumentFieldComponent } from './read-document-field.component';
import { DebugElement } from '@angular/core';
import { FieldType } from '../../../domain/definition/field-type.model';
import { CaseField } from '../../../domain/definition/case-field.model';
import { attr, text } from '../../../test/helpers';
import createSpyObj = jasmine.createSpyObj;
import { By } from '@angular/platform-browser';
import { DocumentUrlPipe } from './document-url.pipe';
import { AbstractAppConfig } from '../../../../app.config';
import { FormGroup } from '@angular/forms';
import { WindowService } from '../../../services/window';
import { DocumentManagementService } from '../../../services/document-management';
import { Router, ActivatedRoute } from '@angular/router';
import any = jasmine.any;
import { CasesService } from '../../case-editor/services/cases.service';
import { of } from 'rxjs';

describe('ReadDocumentFieldComponent', () => {

  const FIELD_ID = 'ReadOnlyFieldId';
  const FIELD_TYPE: FieldType = {
    id: 'Document',
    type: 'Document'
  };
  const VALUE = {
    'document_url': 'https://www.example.com',
    'document_binary_url': 'https://www.example.com/binary',
    'document_filename': 'evidence_document.evd'
  };
  let mockDocumentManagementService: any;
  let windowService;
  let router: any;

  describe('Non-persistable readonly document field', () => {
    const CASE_FIELD: CaseField = <CaseField>({
      id: 'x',
      label: 'X',
      display_context: 'OPTIONAL',
      field_type: FIELD_TYPE,
      value: VALUE
    });
    const GATEWAY_DOCUMENT_URL = 'http://localhost:1234/documents';
    const GATEWAY_HRS_URL = 'http://localhost:1234/hearing-recordings';
    const DOCUMENT_CLICKABLE_HREF = 'javascript:void(0)';

    let fixture: ComponentFixture<ReadDocumentFieldComponent>;
    let component: ReadDocumentFieldComponent;
    let de: DebugElement;
    let mockAppConfig: any;
    let mockCasesService: any;

    beforeEach(() => {
      mockAppConfig = createSpyObj<AbstractAppConfig>('AppConfig',
        ['getDocumentManagementUrl', 'getRemoteDocumentManagementUrl', 'getHrsUrl', 'getRemoteHrsUrl']);
      mockAppConfig.getDocumentManagementUrl.and.returnValue(GATEWAY_DOCUMENT_URL);
      mockAppConfig.getRemoteDocumentManagementUrl.and.returnValue(VALUE.document_binary_url);
      mockAppConfig.getHrsUrl.and.returnValue(GATEWAY_HRS_URL);
      mockAppConfig.getRemoteHrsUrl.and.returnValue(VALUE.document_binary_url);
      mockDocumentManagementService = createSpyObj<DocumentManagementService>('documentManagementService',
        ['uploadFile', 'getMediaViewerInfo']);
      windowService = createSpyObj('windowService', ['setLocalStorage', 'getLocalStorage']);
      router = createSpyObj<Router>('router', ['navigate', 'createUrlTree']);
      router.navigate.and.returnValue(new Promise(any));
      mockCasesService = createSpyObj<CasesService>('casesService', ['getCaseViewV2']);

      TestBed
        .configureTestingModule({
          imports: [],
          declarations: [
            ReadDocumentFieldComponent,
            DocumentUrlPipe
          ],
          providers: [
            { provide: AbstractAppConfig, useValue: mockAppConfig },
            { provide: DocumentManagementService, useValue: mockDocumentManagementService },
            { provide: WindowService, useValue: windowService },
            { provide: Router, useValue: router },
            { provide: ActivatedRoute, useValue: {snapshot: {params: {'cid': '123'}}}},
            { provide: CasesService, useValue: mockCasesService }
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
      expect(attr(linkElement, 'href')).toEqual(DOCUMENT_CLICKABLE_HREF);
    });

    it('should call Media Viewer when the document link is clicked', () => {
      component.caseField.value = VALUE;
      fixture.detectChanges();
      spyOn(component, 'showMediaViewer');
      let linkElement = de.query(By.css('a'));
      expect(linkElement).toBeTruthy();
      linkElement.triggerEventHandler('click', null);
      fixture.detectChanges();
      expect(component.showMediaViewer).toHaveBeenCalled();
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

  describe('Persistable readonly document field', () => {
    const FORM_GROUP: FormGroup = new FormGroup({});
    const CASE_FIELD: CaseField = <CaseField>({
      id: FIELD_ID,
      label: 'X',
      display_context: 'OPTIONAL',
      field_type: FIELD_TYPE,
      value: VALUE
    });
    const GATEWAY_DOCUMENT_URL = 'http://localhost:1234/documents';
    const GATEWAY_HRS_URL = 'http://localhost:1234/hearing-recordings';

    let fixture: ComponentFixture<ReadDocumentFieldComponent>;
    let component: ReadDocumentFieldComponent;
    let de: DebugElement;
    let mockAppConfig: any;
    let mockCasesService: any;

    beforeEach(() => {
      mockAppConfig = createSpyObj<AbstractAppConfig>('AppConfig', [
        'getDocumentManagementUrl', 'getRemoteDocumentManagementUrl', 'getHrsUrl', 'getRemoteHrsUrl'
      ]);
      mockAppConfig.getDocumentManagementUrl.and.returnValue(GATEWAY_DOCUMENT_URL);
      mockAppConfig.getRemoteDocumentManagementUrl.and.returnValue(VALUE.document_binary_url);
      mockAppConfig.getHrsUrl.and.returnValue(GATEWAY_HRS_URL);
      mockAppConfig.getRemoteHrsUrl.and.returnValue(VALUE.document_binary_url);
      mockDocumentManagementService = createSpyObj<DocumentManagementService>('documentManagementService', ['uploadFile']);
      windowService = createSpyObj('windowService', ['setLocalStorage', 'getLocalStorage']);
      router = createSpyObj<Router>('router', ['navigate']);
      router.navigate.and.returnValue(new Promise(any));
      mockCasesService = createSpyObj<CasesService>('casesService', ['getCaseViewV2']);

      TestBed
        .configureTestingModule({
          imports: [],
          declarations: [
            ReadDocumentFieldComponent,
            DocumentUrlPipe
          ],
          providers: [
            { provide: AbstractAppConfig, useValue: mockAppConfig },
            { provide: DocumentManagementService, useValue: mockDocumentManagementService },
            { provide: WindowService, useValue: windowService },
            { provide: Router, useValue: router },
            { provide: ActivatedRoute, useValue: {snapshot: {params: {'cid': '123'}}}},
            { provide: CasesService, useValue: mockCasesService }
          ]
        })
        .compileComponents();

      mockCasesService.getCaseViewV2.and.returnValue(of({
        case_id: 'dummy',
        case_type: {
          jurisdiction: {
            id: 'd'
          }
        }
      }));

      fixture = TestBed.createComponent(ReadDocumentFieldComponent);
      component = fixture.componentInstance;

      component.caseField = CASE_FIELD;
      component.formGroup = FORM_GROUP;

      de = fixture.debugElement;
      fixture.detectChanges();
    });

    it('should register readonly case field value with form group', () => {
      expect(FORM_GROUP.controls[FIELD_ID]).toBeTruthy();
      expect(FORM_GROUP.controls[FIELD_ID].value).toBe(VALUE);
    });

  });

});
