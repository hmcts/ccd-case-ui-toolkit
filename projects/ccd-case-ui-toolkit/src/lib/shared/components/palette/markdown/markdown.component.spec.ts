import { HttpClientTestingModule } from '@angular/common/http/testing';
import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NgxMdComponent, NgxMdModule } from 'ngx-md';
import { PipesModule } from '../../../pipes/pipes.module';
import { MockRpxTranslatePipe } from '../../../test/mock-rpx-translate.pipe';
import { ConvertHrefToRouterService } from '../../case-editor';
import { MarkdownComponent as CCDMarkDownComponent } from './markdown.component';

describe('MarkdownComponent - Table', () => {

  const $MARKDOWN = By.css('markdown');

  const CONTENT = `| Tables | Are | Cool |
 |----------|:-------------:|------:|
 | col 1 is | left-aligned | $1600 |
 | col 2 is | centered | $12 |
 | col 3 is | right-aligned | $1 |`;
  const EXPECTED_CONTENT = `<table>
<thead>
<tr>
<th>Tables</th>
<th align="center">Are</th>
<th align="right">Cool</th>
</tr>
</thead>
<tbody><tr>
<td>col 1 is</td>
<td align="center">left-aligned</td>
<td align="right">$1600</td>
</tr>
<tr>
<td>col 2 is</td>
<td align="center">centered</td>
<td align="right">$12</td>
</tr>
<tr>
<td>col 3 is</td>
<td align="center">right-aligned</td>
<td align="right">$1</td>
</tr>
</tbody></table>`;

  let fixture: ComponentFixture<CCDMarkDownComponent>;
  let component: CCDMarkDownComponent;
  let de: DebugElement;
  let convertHrefToRouterService: ConvertHrefToRouterService;

  beforeEach(waitForAsync(() => {
    convertHrefToRouterService = jasmine.createSpyObj('ConvertHrefToRouterService', ['updateHrefLink']);
    TestBed
      .configureTestingModule({
        imports: [
          HttpClientTestingModule,
          NgxMdModule.forRoot(),
          PipesModule,
          HttpClientTestingModule
        ],
        declarations: [
          CCDMarkDownComponent,
          MockRpxTranslatePipe
        ],
        providers: [
          NgxMdComponent
        ]
      })
      .compileComponents();

    fixture = TestBed.createComponent(CCDMarkDownComponent);
    component = fixture.componentInstance;
    component.content = CONTENT;
    de = fixture.debugElement;
    fixture.detectChanges();
  }));

  it('Should render an html table', () => {
    expect(de.query($MARKDOWN).nativeElement.innerHTML).toBe(EXPECTED_CONTENT);
  });
});

describe('MarkdownComponent - Anchor', () => {

  const $MARKDOWN = By.css('markdown');

  const CONTENT = `[Add case note](/case/IA/Asylum/1632395877596617/trigger/addCaseNote)`;
  const EXPECTED_CONTENT = `<p><a href="/case/IA/Asylum/1632395877596617/trigger/addCaseNote">Add case note</a></p>`;

  let fixture: ComponentFixture<CCDMarkDownComponent>;
  let component: CCDMarkDownComponent;
  let de: DebugElement;
  let convertHrefToRouterService: ConvertHrefToRouterService;

  beforeEach(waitForAsync(() => {

    TestBed
      .configureTestingModule({
        imports: [
          HttpClientTestingModule,
          NgxMdModule.forRoot(),
          PipesModule
        ],
        declarations: [
          CCDMarkDownComponent,
          MockRpxTranslatePipe
        ],
        providers: [
          NgxMdComponent,
          ConvertHrefToRouterService
        ]
      })
      .compileComponents();
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(CCDMarkDownComponent);
      component = fixture.componentInstance;
      de = fixture.debugElement;
      convertHrefToRouterService = TestBed.inject(ConvertHrefToRouterService);
    });

  it('should invoke onMarkdownClick() on markdown click', (done) => {
    component.content = CONTENT;
    const spyMarkdownClick = spyOn(component, 'onMarkdownClick').and.callThrough();
    const markdown = de.query($MARKDOWN).nativeElement;
    markdown.click();
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(spyMarkdownClick).toHaveBeenCalled();
      done();
    });
  });

  it('should render URLs to text without turning them into links', () => {
    component.content =  `www.google.com`;
    const EXPECTED_CONTENT = `<a href="www.google.com">www.google.com</a>`;
    fixture.detectChanges();
    expect(de.query($MARKDOWN).nativeElement.innerHTML).not.toBe(EXPECTED_CONTENT);
  });

  it('should render internal URLs into links', () => {
    component.content = CONTENT;
    fixture.detectChanges();
    expect(de.query($MARKDOWN).nativeElement.innerHTML).toBe(EXPECTED_CONTENT);
  });

  it('should render URLs into links when renderUrlToTextFeature is set false', () => {
    component.content = CONTENT;
    component.renderUrlToTextFeature = false;
    fixture.detectChanges();
    expect(de.query($MARKDOWN).nativeElement.innerHTML).toBe(EXPECTED_CONTENT);
  });
});