import { registerLocaleData } from '@angular/common';
import { DebugElement, LOCALE_ID } from '@angular/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { PaginatePipe, PaginationControlsComponent, PaginationControlsDirective, PaginationService } from 'ngx-pagination';
import { PaginationComponent } from './pagination.component';
import { ComponentTestComponent, getControlsDirective, getPageLinkItems, overrideTemplate } from './testing/testing-helpers';

import locale from '@angular/common/locales/de';

registerLocaleData(locale);

describe('PaginationComponent:', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        PaginationControlsComponent,
        PaginationControlsDirective,
        PaginationComponent,
        ComponentTestComponent,
        PaginatePipe
      ],
      providers: [PaginationService, { provide: LOCALE_ID, useValue: 'en_US' }],
    });
  });

  it('should display the correct page links (simple)', fakeAsync(() => {
    const fixture = TestBed.createComponent(ComponentTestComponent);
    const instance = fixture.componentInstance;
    instance.config.itemsPerPage = 30;
    fixture.detectChanges();

    const expected = ['1', '2', '3', '4'];

    expect(getPageLinkItems(fixture)).toEqual(expected);
  }));

  it('should display the correct page links (formatted numbers over 1000) with comma', fakeAsync(() => {
    const fixture = TestBed.createComponent(ComponentTestComponent);
    const instance = fixture.componentInstance;
    instance.collection = Array.from(new Array(1000), (x, i) => `item ${i + 1}`);
    instance.config.itemsPerPage = 1;
    fixture.detectChanges();

    const expected = ['1', '2', '3', '4', '5', '6', '7', '...', '1,000'];
    expect(getPageLinkItems(fixture)).toEqual(expected);
  }));

  it('should display the correct page links (formatted numbers over 1000) with dot', fakeAsync(() => {
    TestBed.configureTestingModule({
      declarations: [PaginationControlsComponent, PaginationControlsDirective, ComponentTestComponent, PaginatePipe],
      providers: [PaginationService, { provide: LOCALE_ID, useValue: 'de_DE' }],
    });

    const fixture = TestBed.createComponent(ComponentTestComponent);
    const instance = fixture.componentInstance;
    instance.collection = Array.from(new Array(1000), (x, i) => `item ${i + 1}`);
    instance.config.itemsPerPage = 1;
    fixture.detectChanges();

    const expected = ['1', '2', '3', '4', '5', '6', '7', '...', '1.000'];
    expect(getPageLinkItems(fixture)).toEqual(expected);
  }));

  it('should display the correct page links (end ellipsis)', fakeAsync(() => {
    const fixture = TestBed.createComponent(ComponentTestComponent);
    const instance = fixture.componentInstance;
    instance.config.itemsPerPage = 10;
    fixture.detectChanges();

    const expected = ['1', '2', '3', '4', '5', '6', '7', '...', '10'];

    expect(getPageLinkItems(fixture)).toEqual(expected);
  }));

  it('should display the correct page links (start ellipsis)', fakeAsync(() => {
    const fixture = TestBed.createComponent(ComponentTestComponent);
    const instance: ComponentTestComponent = fixture.componentInstance;
    instance.config.itemsPerPage = 10;
    instance.config.currentPage = 10;
    fixture.detectChanges();

    const expected = ['1', '...', '4', '5', '6', '7', '8', '9', '10'];

    expect(getPageLinkItems(fixture)).toEqual(expected);
  }));

  it('should display the correct page links (double ellipsis)', fakeAsync(() => {
    const fixture = TestBed.createComponent(ComponentTestComponent);
    const instance: ComponentTestComponent = fixture.componentInstance;
    instance.config.itemsPerPage = 1;
    instance.config.currentPage = 50;
    fixture.detectChanges();

    const expected = ['1', '...', '48', '49', '50', '51', '52', '...', '100'];

    expect(getPageLinkItems(fixture)).toEqual(expected);
  }));

  it('should add "ellipsis" class to ellipsis links', fakeAsync(() => {
    const fixture = TestBed.createComponent(ComponentTestComponent);
    const instance: ComponentTestComponent = fixture.componentInstance;
    instance.config.itemsPerPage = 1;
    instance.config.currentPage = 50;
    fixture.detectChanges();

    const listItems = fixture.debugElement.queryAll(By.css('ccd-pagination li'))
      .filter(el => (el.nativeElement as HTMLLIElement).classList.contains('small-screen') === false)
      .map((el: DebugElement) => el.nativeElement);

    expect(listItems[2].classList.contains('ellipsis')).toBe(true);
    expect(listItems[8].classList.contains('ellipsis')).toBe(true);
  }));

  it('should update links when collection size changes', fakeAsync(() => {
    const fixture = TestBed.createComponent(ComponentTestComponent);
    const instance: ComponentTestComponent = fixture.componentInstance;
    let expected = ['1', '2', '3', '4', '5', '6', '7', '...', '10'];
    fixture.detectChanges();

    expect(getPageLinkItems(fixture)).toEqual(expected);

    instance.collection.push('item 101');
    fixture.detectChanges();

    expected = ['1', '2', '3', '4', '5', '6', '7', '...', '11'];
    expect(getPageLinkItems(fixture)).toEqual(expected);
  }));

  it('should update the currently-active page when currentPage changes', fakeAsync(() => {
    const fixture = TestBed.createComponent(ComponentTestComponent);
    const instance: ComponentTestComponent = fixture.componentInstance;
    const controlsDirective = getControlsDirective(fixture);
    fixture.detectChanges();

    expect(controlsDirective.getCurrent()).toBe(1);

    instance.config.currentPage = 2;
    fixture.detectChanges();

    expect(controlsDirective.getCurrent()).toBe(2);
  }));

  it('should highlight the currently-active page when currentPage is passed as a numeric string', fakeAsync(() => {
    const fixture = TestBed.createComponent(ComponentTestComponent);
    const instance: ComponentTestComponent = fixture.componentInstance;
    instance.config.currentPage = '2' as any;
    fixture.detectChanges();

    const current: DebugElement = fixture.debugElement.query(By.css('.current'));

    expect(current).not.toBeNull();
    expect(current.nativeElement.innerText).toContain('2');
  }));

  it('should allow the pagination-controls to come before the PaginatePipe', () => {
    overrideTemplate(ComponentTestComponent, `
            <ccd-pagination [id]="config.id"></ccd-pagination>
            <ul>
                <li *ngFor="let item of collection | paginate: config" class="list-item">{{ item }}</li>
            </ul>`);
    const fixture = TestBed.createComponent(ComponentTestComponent);
    const instance = fixture.componentInstance;
    const controlsDirective = getControlsDirective(fixture);
    fixture.detectChanges();

    expect(controlsDirective.getCurrent()).toBe(1);

    instance.config.currentPage = 2;
    fixture.detectChanges();

    expect(controlsDirective.getCurrent()).toBe(2);
  });

  it('should allow multiple independent instances (controller test)', () => {
    overrideTemplate(ComponentTestComponent, `
            <ul class="list1">
               <li *ngFor="let item of collection | paginate: {id: 'test1', itemsPerPage: 10, currentPage: p1 }"
                   class="list-item">{{ item }}</li>
            </ul>
            <ccd-pagination id="test1"></ccd-pagination>
            <ul class="list2">
               <li *ngFor="let item of collection | paginate: {id: 'test2', itemsPerPage: 10, currentPage: p2 }"
                   class="list-item">{{ item }}</li>
            </ul>
            <ccd-pagination id="test2"></ccd-pagination>`);

    const fixture = TestBed.createComponent(ComponentTestComponent);
    const instance = fixture.componentInstance;
    (instance as any).p1 = 1;
    (instance as any).p2 = 1;

    fixture.detectChanges();

    const controls: PaginationControlsDirective[] = fixture
      .debugElement.queryAll(By.css('pagination-template'))
      .map(el => el.references['p']);

    expect(controls[0].getCurrent()).toBe(1);
    expect(controls[1].getCurrent()).toBe(1);

    (instance as any).p1 = 2;
    fixture.detectChanges();

    expect(controls[0].getCurrent()).toBe(2);
    expect(controls[1].getCurrent()).toBe(1);
  });

  it('should allow multiple independent instances (template test)', fakeAsync(() => {
    overrideTemplate(ComponentTestComponent, `
            <ul class="list1">
               <li *ngFor="let item of collection | paginate: {id: 'test1', itemsPerPage: 10, currentPage: p1 }"
                   class="list-item">{{ item }}</li>
            </ul>
            <ccd-pagination id="test1" (pageChange)="p1 = $event"></ccd-pagination>
            <ul class="list2">
               <li *ngFor="let item of collection | paginate: {id: 'test2', itemsPerPage: 10, currentPage: p2 }"
                   class="list-item">{{ item }}</li>
            </ul>
            <ccd-pagination id="test2" (pageChange)="p2 = $event"></ccd-pagination>`);

    const fixture = TestBed.createComponent(ComponentTestComponent);
    const instance = fixture.componentInstance;
    (instance as any).p1 = 1;
    (instance as any).p2 = 1;

    fixture.detectChanges();

    const controls: DebugElement[] = fixture.debugElement.queryAll(By.css('pagination-template'));
    const controlsDirectives: PaginationControlsDirective[] = controls.map(el => el.references['p']);

    expect(controlsDirectives[0].getCurrent()).toBe(1);
    expect(controlsDirectives[1].getCurrent()).toBe(1);

    controls[0].nativeElement.querySelector('.pagination-next a').click();
    tick();
    fixture.detectChanges();

    expect(controlsDirectives[0].getCurrent()).toBe(2);
    expect(controlsDirectives[1].getCurrent()).toBe(1);
  }));

  it('"autoHide" should be boolean', () => {
    const fixture = TestBed.createComponent(ComponentTestComponent);
    const controlsInstance = fixture.debugElement.query(By.css('ccd-pagination')).componentInstance;
    expect(controlsInstance.autoHide).toBe(false);
  });

  it('"autoHide" should work with non-data-bound values', () => {
    overrideTemplate(ComponentTestComponent, `
            <ul>
                <li *ngFor="let item of collection | paginate: config" class="list-item">{{ item }}</li>
            </ul>
            <ccd-pagination autoHide="false" [id]="config.id"></ccd-pagination>`);
    const fixture = TestBed.createComponent(ComponentTestComponent);
    fixture.detectChanges();
    const controlsCmp: PaginationControlsComponent = fixture.debugElement
      .query(By.css('ccd-pagination')).componentInstance;

    expect(controlsCmp.autoHide).toBe(false);
  });

  it('"autoHide" state should be reflected in default template', () => {
    const fixture = TestBed.createComponent(ComponentTestComponent);
    const instance = fixture.componentInstance;
    instance.config.itemsPerPage = 100;
    fixture.detectChanges();

    expect(getPageLinkItems(fixture).length).toBe(0);

    instance.autoHide = false;
    fixture.detectChanges();

    expect(getPageLinkItems(fixture).length).toBe(1);
  });

  it('"directionLinks" should be boolean', () => {
    const fixture = TestBed.createComponent(ComponentTestComponent);
    const controlsInstance = fixture.debugElement.query(By.css('ccd-pagination')).componentInstance;
    expect(controlsInstance.directionLinks).toBe(true);
  });

  it('"directionLinks" should work with non-data-bound values', () => {
    overrideTemplate(ComponentTestComponent, `
            <ul>
                <li *ngFor="let item of collection | paginate: config" class="list-item">{{ item }}</li>
            </ul>
            <ccd-pagination directionLinks="false" [id]="config.id"></ccd-pagination>`);
    const fixture = TestBed.createComponent(ComponentTestComponent);
    fixture.detectChanges();
    const controlsCmp: PaginationControlsComponent = fixture.debugElement
      .query(By.css('ccd-pagination')).componentInstance;

    expect(controlsCmp.directionLinks).toBe(false);
  });

  it('"responsive" should work with non-data-bound values', () => {
    overrideTemplate(ComponentTestComponent, `
            <ul>
                <li *ngFor="let item of collection | paginate: config" class="list-item">{{ item }}</li>
            </ul>
            <ccd-pagination responsive="true" [id]="config.id"></ccd-pagination>`);
    const fixture = TestBed.createComponent(ComponentTestComponent);
    fixture.detectChanges();
    const controlsCmp: PaginationControlsComponent = fixture.debugElement
      .query(By.css('ccd-pagination')).componentInstance;

    expect(controlsCmp.responsive).toBe(true);
  });

  describe('PaginationComponent', () => {
    let component: PaginationComponent;

    beforeEach(() => {
      component = new PaginationComponent();
    });

    it('should update current page when valid page number entered', () => {
      const mockPagination = {
        getCurrent: () => 1,
        setCurrent: jasmine.createSpy('setCurrent')
      };
      const mockEvent = {
        target: {
          value: '2'
        }
      };

      component.goToPage(mockEvent, mockPagination);

      expect(mockPagination.setCurrent).toHaveBeenCalledWith(2);
    });

    it('should update current page when negative page number entered', () => {
      const mockPagination = {
        getCurrent: () => 3,
        setCurrent: jasmine.createSpy('setCurrent')
      };
      const mockEvent = {
        target: {
          value: '-2'
        }
      };

      component.goToPage(mockEvent, mockPagination);

      expect(mockEvent.target.value).toBe('2');
      expect(mockPagination.setCurrent).toHaveBeenCalledWith(2);
    });

    it('should clear input when empty page number entered', () => {
      const mockPagination = {
        getCurrent: () => 5,
        setCurrent: jasmine.createSpy('setCurrent')
      };
      const mockEvent = {
        target: {
          value: ''
        }
      };

      component.goToPage(mockEvent, mockPagination);

      expect(mockEvent.target.value).toBe('');
      expect(mockPagination.setCurrent).not.toHaveBeenCalled();
    });

    it('should not update current page when same page number entered', () => {
      const mockPagination = {
        getCurrent: () => 4,
        setCurrent: jasmine.createSpy('setCurrent')
      };
      const mockEvent = {
        target: {
          value: '4'
        }
      };

      component.goToPage(mockEvent, mockPagination);

      expect(mockPagination.setCurrent).not.toHaveBeenCalled();
    });
  });

  describe('custom labels', () => {
    const TEST_LABEL = 'pqowieur';

    it('previousLabel should bind in correct locations', fakeAsync(() => {
      overrideTemplate(ComponentTestComponent, `
                   <ul>
                       <li *ngFor="let item of collection | paginate: config" class="list-item">{{ item }}</li>
                   </ul>
                   <ccd-pagination previousLabel="${TEST_LABEL}" id="test"></ccd-pagination>`);
      const fixture = TestBed.createComponent(ComponentTestComponent);
      const instance = fixture.componentInstance;
      const expected = `${TEST_LABEL} page`;
      fixture.detectChanges();

      const prevSpan = fixture.debugElement.query(By.css('.pagination-previous > span')).nativeElement;
      expect(prevSpan.innerText.replace(/\n/, ' ')).toContain(expected);

      instance.config.currentPage = 2;
      fixture.detectChanges();

      const prevA = fixture.debugElement.query(By.css('.pagination-previous > a')).nativeElement;
      expect(prevA.innerText.replace(/\n/, ' ')).toContain(expected);
      expect(prevA.getAttribute('aria-label')).toBe(expected);
    }));

    it('nextLabel should bind in correct locations', fakeAsync(() => {
      overrideTemplate(ComponentTestComponent, `
                   <ul>
                       <li *ngFor="let item of collection | paginate: config" class="list-item">{{ item }}</li>
                   </ul>
                   <ccd-pagination nextLabel="${TEST_LABEL}" id="test"></ccd-pagination>`);
      const fixture = TestBed.createComponent(ComponentTestComponent);
      const instance = fixture.componentInstance;
      const expected = `${TEST_LABEL} page`;
      fixture.detectChanges();

      const nextA = fixture.debugElement.query(By.css('.pagination-next > a')).nativeElement;
      expect(nextA.innerText.replace(/\n/, '')).toContain(expected);
      expect(nextA.getAttribute('aria-label')).toBe(expected);

      instance.config.currentPage = 10;
      fixture.detectChanges();

      const nextSpan = fixture.debugElement.query(By.css('.pagination-next > span')).nativeElement;
      expect(nextSpan.innerText.replace(/\n/, '')).toContain(expected);
    }));

    it('screenReaderPaginationLabel should bind in correct locations', fakeAsync(() => {
      overrideTemplate(ComponentTestComponent, `
                           <ul>
                               <li *ngFor="let item of collection | paginate: config" class="list-item">{{ item }}</li>
                           </ul>
                           <pagination-controls screenReaderPaginationLabel="${TEST_LABEL}" id="test"></pagination-controls>`);
      const fixture = TestBed.createComponent(ComponentTestComponent);
      fixture.detectChanges();

      const paginationUl = fixture.debugElement.query(By.css('ul.ngx-pagination')).nativeElement;
      expect(paginationUl.getAttribute('aria-label')).toBe(TEST_LABEL);
    }));

    it('screenReaderPageLabel should bind in correct locations', fakeAsync(() => {
      overrideTemplate(ComponentTestComponent, `
                   <ul>
                       <li *ngFor="let item of collection | paginate: config" class="list-item">{{ item }}</li>
                   </ul>
                   <ccd-pagination screenReaderPageLabel="${TEST_LABEL}" id="test"></ccd-pagination>`);
      const fixture = TestBed.createComponent(ComponentTestComponent);
      const instance = fixture.componentInstance;
      instance.config.currentPage = 5;

      fixture.detectChanges();

      const prevA = fixture.debugElement.query(By.css('.pagination-previous > a')).nativeElement;
      expect(prevA.innerText.replace(/\n/, ' ')).toContain(`Previous ${TEST_LABEL}`);
      expect(prevA.getAttribute('aria-label')).toBe(`Previous ${TEST_LABEL}`);

      const nextA = fixture.debugElement.query(By.css('.pagination-next > a')).nativeElement;
      expect(nextA.innerText.replace(/\n/, '')).toContain(`Next ${TEST_LABEL}`);
      expect(nextA.getAttribute('aria-label')).toBe(`Next ${TEST_LABEL}`);

      const pageA = fixture.debugElement.queryAll(By.css('.ngx-pagination li > a'))[1].nativeElement;
      expect(pageA.innerText.replace(/\n/, ' ')).toContain(`${TEST_LABEL} 1`);
    }));

    it('screenReaderCurrentLabel should bind in correct locations', fakeAsync(() => {
      overrideTemplate(ComponentTestComponent, `
                   <ul>
                       <li *ngFor="let item of collection | paginate: config" class="list-item">{{ item }}</li>
                   </ul>
                   <ccd-pagination screenReaderCurrentLabel="${TEST_LABEL}" id="test"></ccd-pagination>`);
      const fixture = TestBed.createComponent(ComponentTestComponent);

      fixture.detectChanges();

      const currentPage = fixture.debugElement.query(By.css('.ngx-pagination li.current .show-for-sr')).nativeElement;
      expect(currentPage.innerText).toContain(`${TEST_LABEL}`);
    }));
  });
});
