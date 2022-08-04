import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, DebugElement, ViewChild } from '@angular/core';
import { MarkdownComponent as CCDMarkDownComponent } from './markdown.component';
import { NgxMdModule, NgxMdComponent } from 'ngx-md';
import { By } from '@angular/platform-browser';
import { PipesModule } from '../../pipes';
import { ConvertHrefToRouterService } from '../case-editor/services';

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

  beforeEach(async(() => {
    convertHrefToRouterService = jasmine.createSpyObj('ConvertHrefToRouterService', ['updateHrefLink']);
    TestBed
      .configureTestingModule({
        imports: [
          NgxMdModule.forRoot(),
          PipesModule
        ],
        declarations: [
          CCDMarkDownComponent,
        ],
        providers: [
          NgxMdComponent,
          { provide: ConvertHrefToRouterService, useValue: convertHrefToRouterService }
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

  let CONTENT = `[Add case note](/case/IA/Asylum/1632395877596617/trigger/addCaseNote)`;
  let EXPECTED_CONTENT = `<p><a href="/case/IA/Asylum/1632395877596617/trigger/addCaseNote">Add case note</a></p>`;

  let fixture: ComponentFixture<CCDMarkDownComponent>;
  let component: CCDMarkDownComponent;
  let de: DebugElement;
  let convertHrefToRouterService: ConvertHrefToRouterService;

  it('should not call updateHrefLink', () => {
    component.markdownUseHrefAsRouterLink = true;
    const event = new MouseEvent('mousedown', {clientX: 50, clientY: 150});
    component.onMarkdownClick(event);
    fixture.detectChanges();
    expect(convertHrefToRouterService.updateHrefLink).not.toHaveBeenCalled();
  });
});

describe('MarkdownComponent - Anchor', () => {

  const $MARKDOWN = By.css('markdown');

  let CONTENT = `[Add case note](/case/IA/Asylum/1632395877596617/trigger/addCaseNote)`;
  let EXPECTED_CONTENT = `<p><a href="/case/IA/Asylum/1632395877596617/trigger/addCaseNote">Add case note</a></p>`;

  let fixture: ComponentFixture<CCDMarkDownComponent>;
  let component: CCDMarkDownComponent;
  let de: DebugElement;
  let convertHrefToRouterService: ConvertHrefToRouterService;

  beforeEach((async () => {
    convertHrefToRouterService = jasmine.createSpyObj('ConvertHrefToRouterService', ['updateHrefLink']);

    await TestBed
      .configureTestingModule({
        imports: [
          NgxMdModule.forRoot(),
          PipesModule
        ],
        declarations: [
          CCDMarkDownComponent,
        ],
        providers: [
          NgxMdComponent,
          { provide: ConvertHrefToRouterService, useValue: convertHrefToRouterService }
        ]
      })
      .compileComponents();

    fixture = TestBed.createComponent(CCDMarkDownComponent);
    component = fixture.componentInstance;
    component.content = CONTENT;
    component.markdownUseHrefAsRouterLink = true;
    de = fixture.debugElement;
    fixture.detectChanges();
  }));

  it('Should render an anchor and paragraph elements', () => {
    expect(de.query($MARKDOWN).nativeElement.innerHTML).toBe(EXPECTED_CONTENT);
  });

  it('should invoke onMarkdownClick() on markdown click', (done) => {
    const spyMarkdownClick = spyOn(component, 'onMarkdownClick').and.callThrough();
    const markdown = de.query(By.css('markdown')).nativeElement;
    markdown.click();
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(spyMarkdownClick).toHaveBeenCalled();
      done();
    });
  });

  it('should invoke callUpdateHrefLink() and call updateHrefLink', (done) => {
    const anchor = { pathname: '/case/IA/Asylum/1632395877596617/trigger/addCaseNote'} as HTMLAnchorElement;
    const event = new MouseEvent('click');
    component.callUpdateHrefLink(anchor, event);
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(convertHrefToRouterService.updateHrefLink).toHaveBeenCalled();
      done();
    });
  });

  it('should not invoke callUpdateHrefLink() on URL with hash', (done) => {
    const anchor = { pathname: '/case/IA/Asylum/1599830705879596', hash: 'Hearing%20and%20appointment'} as HTMLAnchorElement;
    const event = new MouseEvent('click');
    const returnValue = component.callUpdateHrefLink(anchor, event );
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(convertHrefToRouterService.updateHrefLink).not.toHaveBeenCalled();
      expect(returnValue).toBeTruthy();
      done();
    });
  });

  it('should not invoke callUpdateHrefLink() on markdownUseHrefAsRouterLink false', (done) => {
    component.markdownUseHrefAsRouterLink = false;
    const anchor = { pathname: '/case/IA/Asylum/1599830705879596', hash: 'Hearing%20and%20appointment'} as HTMLAnchorElement;
    const event = new MouseEvent('click');
    const returnValue = component.callUpdateHrefLink(anchor, event );
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(convertHrefToRouterService.updateHrefLink).not.toHaveBeenCalled();
      expect(returnValue).toBeTruthy();
      done();
    });
  });

  it('should not invoke callUpdateHrefLink() on markdownUseHrefAsRouterLink false and external link click', (done) => {
    component.markdownUseHrefAsRouterLink = false;
    const anchor = { pathname: 'https://www.bbc.co.uk/news'} as HTMLAnchorElement;
    const event = new MouseEvent('click');
    component.callUpdateHrefLink(anchor, event );
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(convertHrefToRouterService.updateHrefLink).not.toHaveBeenCalled();
      done();
    });
  });
});
