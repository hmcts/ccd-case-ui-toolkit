import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CaseHeaderComponent } from './case-header.component';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { text } from '../../test/helpers';
import { createCaseView } from '../../fixture/case-view.test.fixture';
import { MockComponent } from 'ng2-mock-component';
import { CaseReferencePipe } from '../../pipes';
import { LabelSubstitutorDirective, PlaceholderService } from '../../directives';
import { LabelFieldComponent } from '../palette';
import { FieldsUtils } from '../../services';

describe('CaseHeaderComponent', () => {

  const MarkdownComponent: any = MockComponent({
    selector: 'ccd-markdown',
    inputs: ['content']
  });

  const $HEADING = By.css('h1');
  const $MARKDOWN = By.css('dl>dt ccd-markdown');
  const CASE_DETAILS = createCaseView();

  let fixture: ComponentFixture<CaseHeaderComponent>;
  let component: CaseHeaderComponent;
  let de: DebugElement;

  beforeEach(async(() => {
    TestBed
      .configureTestingModule({
        declarations: [
          CaseHeaderComponent,
          CaseReferencePipe,
          LabelSubstitutorDirective,
          LabelFieldComponent,
          // Mock
          MarkdownComponent
        ],
        providers: [
          FieldsUtils,
          PlaceholderService,
          CaseReferencePipe
        ]
      })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(CaseHeaderComponent);
        component = fixture.componentInstance;
        component.caseDetails = CASE_DETAILS;

        de = fixture.debugElement;
        fixture.detectChanges();
      });
  }));

  it('should render a header with case reference when title display is empty', () => {
    let header = de.query($HEADING);
    fixture
      .whenStable()
      .then(() => {
        expect(header).toBeTruthy();
        expect(text(header)).toEqual('#1234-5678-9012-3456');
      });
  });

  it('should render a header with markdown element when title display is not empty', () => {
    component.caseDetails.state.title_display = 'Title';
    component.ngOnInit();
    fixture.detectChanges();

    let header = de.query($MARKDOWN);
    expect(header).toBeTruthy();
    expect(header.nativeElement.getAttribute('ng-reflect-content')).toEqual('Title');
  });

});
