import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { DebugElement } from '@angular/core';

import { Pipe, PipeTransform } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { QueryCaseDetailsHeaderComponent } from './query-case-details-header.component';

import { By } from '@angular/platform-browser';
import { MockComponent } from 'ng2-mock-component';
import { LabelSubstitutorDirective, PlaceholderService } from '../../../../../directives';
import { createCaseView } from '../../../../../fixture/case-view.test.fixture';
import { CaseReferencePipe } from '../../../../../pipes';
import { FieldsUtils } from '../../../../../services';
import { text } from '../../../../../test/helpers';
import { LabelFieldComponent } from '../../../../palette';
import { RpxTranslatePipe, RpxTranslationConfig, RpxTranslationService } from 'rpx-xui-translation';
import { HttpClient, HttpHandler } from '@angular/common/http';
@Pipe({
    name: 'ccdCaseReference',
    standalone: false
})
class MockCaseReferencePipe implements PipeTransform {
  public transform(value: string, ...args: any[]) {
    return value;
  }
}

describe('QueryCaseDetailsHeaderComponent', () => {
  const markdownComponentMock: any = MockComponent({
    selector: 'ccd-markdown',
    inputs: ['content']
  });

  const $HEADING = By.css('.heading-h1');
  const $MARKDOWN = By.css('dl>dt ccd-markdown');
  const CASE_DETAILS = createCaseView();

  let component: QueryCaseDetailsHeaderComponent;
  let de: DebugElement;

  let fixture: ComponentFixture<QueryCaseDetailsHeaderComponent>;

  beforeEach(async () => {
    const snapshotActivatedRoute = { data: { case: { case_id: '123', title_display: 'TitleDisplay' } } };
    await TestBed.configureTestingModule({
      declarations: [QueryCaseDetailsHeaderComponent, MockCaseReferencePipe,
        CaseReferencePipe,
        LabelSubstitutorDirective,
        LabelFieldComponent,

        // Mocks
        markdownComponentMock
      ],
      providers: [
        FieldsUtils,
        PlaceholderService,
        CaseReferencePipe,
        { provide: ActivatedRoute, useValue: { snapshot: snapshotActivatedRoute } },
        RpxTranslatePipe,
        RpxTranslationService,
        RpxTranslationConfig,
        HttpClient,
        HttpHandler
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QueryCaseDetailsHeaderComponent);
    component = fixture.componentInstance;
    component.caseDetails = CASE_DETAILS;
    de = fixture.debugElement;

    component.ngOnInit();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render a header with case reference when title display is empty', () => {
    const header = de.query($HEADING);
    expect(header).toBeTruthy();
    expect(text(header)).toEqual('#1234-5678-9012-3456');
  });

  it('should render a qm header with markdown element when title display is not empty', async() => {
    component.caseDetails.state.title_display = 'Title';
    component.ngOnInit();

    fixture.detectChanges();

    const header = de.query($MARKDOWN);
    expect(header).toBeTruthy();
    expect(header.nativeElement.getAttribute('ng-reflect-content')).toEqual('Title');
  });
});

