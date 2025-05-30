import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { MockComponent } from 'ng2-mock-component';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { LabelSubstitutorDirective, PlaceholderService } from '../../directives';
import { CaseView, HttpError } from '../../domain';
import { createCaseHistory } from '../../fixture';
import { CaseReferencePipe, CcdTabFieldsPipe, FieldsFilterPipe, ReadFieldsFilterPipe } from '../../pipes';
import { AlertService, FieldsUtils, OrderService } from '../../services';
import { FormatTranslatorService } from '../../services/case-fields/format-translator.service';
import { CaseNotifier } from '../case-editor';
import { PaletteUtilsModule } from '../palette';
import { CaseHistoryComponent } from './case-history.component';
import { CaseHistory } from './domain';
import { CaseHistoryService } from './services';
import createSpyObj = jasmine.createSpyObj;
import any = jasmine.any;
import { RpxTranslatePipe, RpxTranslationConfig, RpxTranslationService } from 'rpx-xui-translation';
import { HttpClient, HttpHandler } from '@angular/common/http';

describe('CaseHistoryComponent', () => {
  const caseHeaderComponent: any = MockComponent({
    selector: 'ccd-case-header',
    inputs: ['caseDetails']
  });

  const markdownComponent: any = MockComponent({
    selector: 'ccd-markdown',
    inputs: ['content']
  });

  // Page object selectors
  const $NAME_TAB_CONTENT = By.css('table#NameTab');
  const $CASE_DETAIL_HEADERS = 'h3';

  const CASE_HISTORY: CaseHistory = createCaseHistory();
  const CASE_HISTORY_OBS: Observable<CaseHistory> = of(CASE_HISTORY);
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
  const FIELDS = CASE_HISTORY.tabs[1].fields;
  const SIMPLE_FIELDS = CASE_HISTORY.tabs[1].fields.slice(0, 2);

  const ERROR: HttpError = new HttpError();
  ERROR.message = 'Critical error!';

  let component: CaseHistoryComponent;
  let fixture: ComponentFixture<CaseHistoryComponent>;
  let de: DebugElement;
  let casesService: any;
  casesService = createSpyObj('casesService', ['getCaseViewV2']);
  const mockRoute: any = {
    snapshot: {
      paramMap: createSpyObj('paramMap', ['get']),
    }
  };

  let router: any;
  let orderService;
  let caseNotifier;
  let caseHistoryService;
  // tslint:disable-next-line: prefer-const
  let alertService: any;

  const fieldReadComponentMock: any = MockComponent({
    selector: 'ccd-field-read', inputs: [
      'caseField', 'caseReference', 'formGroup', 'topLevelFormGroup', 'idPrefix'
    ]
  });

  const linkComponentMock: any = MockComponent({
    selector: 'a', inputs: [
      'routerLink'
    ]
  });

  beforeEach(async () => {
    orderService = new OrderService();
    spyOn(orderService, 'sort').and.callThrough();

    caseNotifier = new CaseNotifier(casesService);
    caseNotifier.caseView = new BehaviorSubject(CASE_VIEW).asObservable();
    router = createSpyObj<Router>('router', ['navigate']);
    router.navigate.and.returnValue(new Promise(any));
    caseHistoryService = createSpyObj<CaseHistoryService>('caseHistoryService', ['get']);
    caseHistoryService.get.and.returnValue(CASE_HISTORY_OBS);

    TestBed
      .configureTestingModule({
        imports: [
          PaletteUtilsModule,
        ],
        declarations: [
          CaseHistoryComponent,
          LabelSubstitutorDirective,

          // Mocks
          fieldReadComponentMock,
          caseHeaderComponent,
          linkComponentMock,
          CcdTabFieldsPipe,
          FieldsFilterPipe,
          ReadFieldsFilterPipe,
          markdownComponent,
          RpxTranslatePipe
        ],
        providers: [
          FieldsUtils,
          PlaceholderService,
          CaseReferencePipe,
          FormatTranslatorService,
          { provide: AlertService, useValue: alertService },
          { provide: ActivatedRoute, useValue: mockRoute },
          { provide: OrderService, useValue: orderService },
          { provide: CaseNotifier, useValue: caseNotifier },
          { provide: CaseHistoryService, useValue: caseHistoryService },
          { provide: Router, useValue: router },
          RpxTranslationService,
          RpxTranslationConfig,
          HttpClient,
          HttpHandler
        ]
      })
      .compileComponents();

    fixture = TestBed.createComponent(CaseHistoryComponent);
    component = fixture.componentInstance;
    de = fixture.debugElement;
    fixture.detectChanges();
  });

  it('should render a case header', () => {
    const header = de.query(By.directive(caseHeaderComponent));
    expect(header).toBeTruthy();
    expect(header.componentInstance.caseDetails).toEqual(CASE_VIEW);
  });

  it('should render the correct case details based on show_condition', () => {
    // we expect address section not to be rendered
    const headers = fixture.nativeElement.querySelectorAll($CASE_DETAIL_HEADERS);

    expect(headers.length).toBe(CASE_HISTORY.tabs.length - 1);
    expect(headers[0].textContent).toBe(CASE_HISTORY.tabs[1].label);
    expect(headers[1].textContent).toBe(CASE_HISTORY.tabs[2].label);
  });

  it('should render the event details first followed by case details', () => {
    const headers = fixture.nativeElement.querySelectorAll('h2');

    expect(headers[0].textContent).toBe('Event Details');
    expect(headers[1].textContent).toBe('Case Details');
  });

  it('should render the field labels based on show_condition', () => {
    const headers = de.query($NAME_TAB_CONTENT).queryAll(By.css('tr>th'));
    expect(headers.find(r => r.nativeElement.textContent.trim() === 'Complex field'))
      .toBeFalsy('Found row with label Complex field');
    expect(headers.find(r => r.nativeElement.textContent.trim() === 'Last name'))
      .toBeTruthy('Cannot find row with label Last name');
    expect(headers.find(r => r.nativeElement.textContent.trim() === 'First name'))
      .toBeTruthy('Cannot find row with label First name');
  });

  it('should render a row for each rendered field in a given section', () => {
    const tab = de.query($NAME_TAB_CONTENT);
    const rows = tab.queryAll(By.css('tr'));
    // The compound row won't be rendered as it's not valid.
    expect(rows.length).toBe(FIELDS.length - 1);
  });

  it('should render each simple field label as a table header', () => {
    const headers = de
      .query($NAME_TAB_CONTENT)
      .queryAll(By.css('tr>th'));

    SIMPLE_FIELDS.forEach(field => {
      expect(headers.find(r => r.nativeElement.textContent.trim() === field.label))
        .toBeTruthy(`Could not find row with label ${field.label}`);
    });
  });

  it('should render each compound field without label as a cell spanning 2 columns', () => {
    const tab = de.query($NAME_TAB_CONTENT);
    const headers = tab.queryAll(By.css('tr.complex-field>th'));
    expect(headers.length).toBe(0);

    // None of the fields are valid compound fields.
    const rows = tab.queryAll(By.css('tr.compound-field'));
    expect(rows.length).toBe(0);
  });

  it('should render each field value using FieldReadComponent', () => {
    const readFields = de
      .query($NAME_TAB_CONTENT)
      .queryAll(By.css('tr td>ccd-field-read'));

    FIELDS.forEach(field => {
      const readField = readFields.find(f => {
        return f.componentInstance.caseField.id === field.id;
      });

      // This one doesn't get rendered as it's filtered out due to being invalid.
      if (field.id === 'PersonComplex') {
        expect(readField).not.toBeDefined();
      } else {
        expect(readField).toBeTruthy(`Could not find field with type ${field.field_type.type}`);
        const readFieldComponent = readField.componentInstance;
        expect(readFieldComponent.caseReference).toEqual(CASE_HISTORY.case_id);
      }
    });
    expect(readFields.length).toBe(FIELDS.length - 1);
  });

  it('should render fields in ascending order', () => {
    const headers = de
      .query($NAME_TAB_CONTENT)
      .queryAll(By.css('tr>th'));

    expect(headers[0].nativeElement.textContent.trim()).toBe(FIELDS[1].label);
  });

  it('should render case history sections in ascending order of tabs', () => {
    const headers = fixture.nativeElement.querySelectorAll($CASE_DETAIL_HEADERS);

    expect(headers[0].textContent).toBe(CASE_HISTORY.tabs[1].label);
    expect(headers[1].textContent).toBe(CASE_HISTORY.tabs[2].label);
    expect(orderService.sort).toHaveBeenCalledWith(CASE_HISTORY.tabs);
  });
});
