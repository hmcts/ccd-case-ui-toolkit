import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MockComponent } from 'ng2-mock-component';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { AbstractAppConfig } from '../../../../app.config';
import { CasePrintDocument, CaseView } from '../../../domain';
import { AlertService } from '../../../services';
import { attr, text } from '../../../test/helpers';
import { MockRpxTranslatePipe } from '../../../test/mock-rpx-translate.pipe';
import { CaseNotifier, CasesService } from '../../case-editor';
import { PaletteUtilsModule } from '../../palette';
import { CasePrinterComponent } from './case-printer.component';
import { PrintUrlPipe } from './pipes/print-url.pipe';
import createSpyObj = jasmine.createSpyObj;

describe('CasePrinterComponent', () => {
  const $DOCUMENTS = By.css('table tbody tr');
  const $DOCUMENT_NAME = By.css('td.document-name a');
  const $DOCUMENT_TYPE = By.css('td.document-type');

  const caseHeaderComponentMock: any = MockComponent({
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
  const DOCUMENT_OBS: Observable<CasePrintDocument[]> = of(DOCUMENTS);

  let fixture: ComponentFixture<CasePrinterComponent>;
  let component: CasePrinterComponent;
  let de: DebugElement;

  let caseService: CaseNotifier;
  let casesService: jasmine.SpyObj<CasesService>;
  let alertService: jasmine.SpyObj<AlertService>;

  let appConfig: jasmine.SpyObj<AbstractAppConfig>;

  beforeEach(waitForAsync(() => {
    appConfig = createSpyObj('AbstractAppConfig', ['getPrintServiceUrl']);
    appConfig.getPrintServiceUrl.and.returnValue(GATEWAY_PRINT_SERVICE_URL);

    casesService = createSpyObj('casesService', ['getCaseViewV2']);
    caseService = new CaseNotifier(casesService);
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
          // Mocks
          caseHeaderComponentMock,
          MockRpxTranslatePipe
        ],
        providers: [
          { provide: CaseNotifier, useValue: caseService },
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
    const header = de.query(By.directive(caseHeaderComponentMock));
    expect(header).toBeTruthy();
    expect(header.componentInstance.caseDetails).toEqual(CASE_VIEW);
  });

  it('should call getPrintDocuments() on init', () => {
    expect(casesService.getPrintDocuments).toHaveBeenCalledWith(CASE_VIEW.case_id);
  });

  it('should retrieve documents from route data', () => {
    caseService.announceCase(CASE_VIEW);
    expect(component.documents).toEqual(DOCUMENTS);
  });

  it('should display each document', () => {
    const documents = de.queryAll($DOCUMENTS);
    expect(documents.length).toEqual(DOCUMENTS.length);

    DOCUMENTS.forEach((document, index) => {
      const documentName = documents[index].query($DOCUMENT_NAME);
      const documentType = documents[index].query($DOCUMENT_TYPE);

      expect(text(documentName)).toEqual(document.name);
      expect(text(documentType)).toEqual(document.type);
      expect(attr(documentName, 'href')).toEqual(GATEWAY_PRINT_SERVICE_URL +
        document.url.replace(REMOTE_PRINT_SERVICE_URL, ''));
    });
  });
});
