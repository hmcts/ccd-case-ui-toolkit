import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { MockComponent } from 'ng2-mock-component';
import { CasePrinterComponent } from './case-printer.component';
import createSpyObj = jasmine.createSpyObj;
import { PrintUrlPipe } from './pipes/print-url.pipe';
import { CaseView, CasePrintDocument } from '../../../domain';
import { AbstractAppConfig } from '../../../../app.config';
import { PaletteUtilsModule } from '../../palette';
import { attr, text } from '../../../test/helpers';
import { CaseService, CasesService } from '../../case-editor';
import { AlertService } from '../../../services';
import { Observable, BehaviorSubject } from 'rxjs';

describe('CasePrinterComponent', () => {

  const $DOCUMENTS = By.css('table tbody tr');
  const $DOCUMENT_NAME = By.css('td.document-name a');
  const $DOCUMENT_TYPE = By.css('td.document-type');

  const CaseHeaderComponent: any = MockComponent({
    selector: 'ccd-case-header',
    inputs: ['caseDetails']
  });

  const CASE_VIEW: CaseView = {
    case_id: '1',
    case_type: {
      id: 'TestAddressBookCase',
      name: 'Test Address Book Case',
      jurisdiction: {
        id: 'TEST',
        name: 'Test',
      }
    },
    channels: [],
    state: {
      id: 'CaseCreated',
      name: 'Case created'
    },
    tabs: [],
    triggers: [],
    events: []
  };
  const GATEWAY_PRINT_SERVICE_URL = 'http://localhost:1234/print';
  const REMOTE_PRINT_SERVICE_URL = 'https://test.service.reform.hmcts.net';
  const DOCUMENTS: CasePrintDocument[] = [
    {
      name: 'Doc1',
      type: 'application/pdf',
      url: `${REMOTE_PRINT_SERVICE_URL}/doc1.pdf`
    },
    {
      name: 'Doc2',
      type: 'image/jpg',
      url: `${REMOTE_PRINT_SERVICE_URL}/doc2.jpg`
    }
  ];
  const DOCUMENT_OBS: Observable<CasePrintDocument[]> = Observable.of(DOCUMENTS);

  let fixture: ComponentFixture<CasePrinterComponent>;
  let component: CasePrinterComponent;
  let de: DebugElement;

  let caseService: CaseService;
  let casesService;
  let alertService;

  let appConfig;

  beforeEach(async(() => {
    appConfig = createSpyObj('AbstractAppConfig', ['getPrintServiceUrl', 'getRemotePrintServiceUrl']);
    appConfig.getPrintServiceUrl.and.returnValue(GATEWAY_PRINT_SERVICE_URL);
    appConfig.getRemotePrintServiceUrl.and.returnValue(REMOTE_PRINT_SERVICE_URL);

    caseService = new CaseService();
    caseService.caseView = new BehaviorSubject(CASE_VIEW).asObservable();
    casesService = createSpyObj('CasesService', ['getPrintDocuments']);
    casesService.getPrintDocuments.and.returnValue(DOCUMENT_OBS);
    alertService = createSpyObj('AlertService', ['error']);
    TestBed
      .configureTestingModule({
        imports: [
          PaletteUtilsModule,
        ],
        declarations: [
          CasePrinterComponent,
          PrintUrlPipe,

          // Mock
          CaseHeaderComponent
        ],
        providers: [
          { provide: CaseService, useValue: caseService },
          { provide: CasesService, useValue: casesService },
          { provide: AlertService, useValue: alertService },
          { provide: AbstractAppConfig, useValue: appConfig }
        ]
      })
      .compileComponents();

    fixture = TestBed.createComponent(CasePrinterComponent);
    component = fixture.componentInstance;
    de = fixture.debugElement;
    fixture.detectChanges();
  }));

  it('should render a case header', () => {
    caseService.announceCase(CASE_VIEW);
    let header = de.query(By.directive(CaseHeaderComponent));
    expect(header).toBeTruthy();
    expect(header.componentInstance.caseDetails).toEqual(CASE_VIEW);
  });

  it('should retrieve documents from route data', () => {
    caseService.announceCase(CASE_VIEW);
    expect(component.documents).toEqual(DOCUMENTS);
  });

  it('should display each document', () => {
    let documents = de.queryAll($DOCUMENTS);

    expect(documents.length).toEqual(DOCUMENTS.length);

    DOCUMENTS.forEach((document, index) => {
      let documentName = documents[index].query($DOCUMENT_NAME);
      let documentType = documents[index].query($DOCUMENT_TYPE);

      expect(text(documentName)).toEqual(document.name);
      expect(text(documentType)).toEqual(document.type);
      expect(attr(documentName, 'href')).toEqual(GATEWAY_PRINT_SERVICE_URL +
        document.url.replace(REMOTE_PRINT_SERVICE_URL, ''));
    });
  });

});
