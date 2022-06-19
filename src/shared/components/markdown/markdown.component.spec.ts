import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
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
    de = fixture.debugElement;
    fixture.detectChanges();
  }));

  // it('Should render an anchor and paragraph elements', () => {
  //   // fixture = TestBed.createComponent(CCDMarkDownComponent);
  //   // component = fixture.componentInstance;
  //   // CONTENT = '[Add case note](/case/IA/Asylum/1632395877596617/trigger/addCaseNote)';
  //   // EXPECTED_CONTENT = '<p><a href="/case/IA/Asylum/1632395877596617/trigger/addCaseNote">Add case note</a></p>';
  //   // component.content = CONTENT;
  //   // de = fixture.debugElement;
  //   // fixture.detectChanges();

  //   console.log("**markdown**");
  //   console.log(de.query($MARKDOWN).nativeElement.innerHTML);

  //   expect(de.query($MARKDOWN).nativeElement.innerHTML).toBe(EXPECTED_CONTENT);
  // });

  // it('should not call updateHrefLink', () => {
  //   // component.markdownUseHrefAsRouterLink = true;
  //   // const anchor = document.createElement('a');
  //   // anchor.href = '/hgh/jhgjhgj';
  //   // anchor.click();
  //   // expect(component.onMarkdownClick).toHaveBeenCalled();

  //   // const event = new MouseEvent('mousedown', {clientX: 50, clientY: 150});
  //   // component.onMarkdownClick(event);
  //   // fixture.detectChanges();
  //   // expect(convertHrefToRouterService.updateHrefLink).not.toHaveBeenCalled();
  //   // component.content = '/click/sds/ere#hello'
  //   const spyAnchorClick = spyOn(component, 'onMarkdownClick').and.callThrough();

  //       fixture.detectChanges();

  //       const anchor = document.createElement('a');
  //       anchor.href = '/sdfs/sds#hash';
  //       expect(anchor).not.toEqual(null); // ok

  //       const event = new MouseEvent('click',
  //           {
  //               view: window,
  //               bubbles: true,
  //               cancelable: true,
  //               relatedTarget: document
  //           });

  //           console.log("**Event**");

  //           console.log(event);

  //           anchor.dispatchEvent(event);

  //           const input = fixture.debugElement.query(By.css('a'));
  // input.triggerEventHandler('click', {});
  // fixture.detectChanges();

  //           const markdownClick = component.onMarkdownClick(event);
  //           tick();
  //       fixture.detectChanges();
  //       expect(spyAnchorClick).toHaveBeenCalled(); // ok
  //       expect(markdownClick).toBeTruthy();
  //       // expect(component.).toBe('ok'); //ok
  // });

  // it('something', () => {
  //   // component.content = '## Current progress of the case\n\n![Progress map showing that the appeal
  // is now at stage 7 of 11 stages - the Listing stage]
  // (https://raw.githubusercontent.com/hmcts/ia-appeal-frontend/master/app/assets/images/caseOfficer_listing.svg)
  // \n\n## Do this next\nYou can view the hearing requirements and any requests for additional adjustments in the
  // [hearing and appointment tab](/case/IA/Asylum/1599830705879596#Hearing%20and%20appointment).<br><br>You should
  // contact the appellant if you need more information.<br><br>You should then
  // [review and submit](/case/IA/Asylum/1599830705879596/trigger/reviewHearingRequirements)
  // the hearing requirements and any additional adjustments.';
  //   const anchor = document.createElement('a');
  //       anchor.href = '/case/IA/Asylum/1599830705879596/trigger/reviewHearingRequirements';
  //   // const event = new MouseEvent('click',
  //   // {
  //   //     view: window,
  //   //     bubbles: true,
  //   //     cancelable: true,
  //   //     relatedTarget: document,
  //   // });
    // anchor.dispatchEvent()
    // let event = {
    //   target: {
    //     pathname: '/case/IA/Asylum/1599830705879596/trigger/reviewHearingRequirements',
    //     hash: null,
    //     search: null
    //   }
    // };

  //   console.log("**Event**");

  //   console.log(event);

  //   console.log("**anchor**");
  //   console.log(anchor);
  //   fixture.detectChanges();

  //   const markdownClick = component.onMarkdownClick(event);

  // })

//   it('hrllo', () => {
//     function myFunction() {
//       alert('It was clicked');
//   }

//   const Anchor = <HTMLAnchorElement>document.createElement('a');
//   Anchor.href = '/hgh/jhgjhgj';

//   Anchor.addEventListener('click', component.onMarkdownClick, false);

// let event = new MouseEvent('click',
//              {
//                  view: window,
//                  bubbles: true,
//                  cancelable: true,
//                  relatedTarget: document,
//              });

//            console.log("**Event**");

// Anchor.dispatchEvent(event);

// expect(component.onMarkdownClick).toHaveBeenCalled();
//  const anchorEvent = {
//    target: <HTMLAnchorElement> {
//       pathname: '/case/IA/Asylum/1599830705879596/trigger/reviewHearingRequirements',
//       hash: null,
//       search: null
//     }
//   };

//   component.onMarkdownClick(anchorEvent);
//   })

  it('should invoke onMarkdownClick() on markdown click', (done) => {
    const spyAnchorClick = spyOn(component, 'onMarkdownClick').and.callThrough();
    const anchor = de.query(By.css('markdown')).nativeElement;
    console.log(anchor);
    // let hello = anchor.querySelector('a');
    anchor.click();

    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(spyAnchorClick).toHaveBeenCalled();
      done();
    });
  });
});
