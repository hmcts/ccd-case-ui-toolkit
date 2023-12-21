import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OverlayModule } from '@angular/cdk/overlay';
import { By } from '@angular/platform-browser';
import { CaseFileViewOverlayMenuComponent } from './case-file-view-overlay-menu.component';

describe('CaseFileViewOverlayMenuComponent', () => {
  let component: CaseFileViewOverlayMenuComponent;
  let fixture: ComponentFixture<CaseFileViewOverlayMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaseFileViewOverlayMenuComponent ],
      imports: [ OverlayModule ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaseFileViewOverlayMenuComponent);
    component = fixture.componentInstance;
    component.menuItems = [
      { actionText: 'Alpha', iconSrc: '/assets/img/alpha.png', actionFn: () => {} },
      { actionText: 'Beta', iconSrc: '/assets/img/beta.png', actionFn: () => {} },
    ];
    component.isOpen = true;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display title if it exists', () => {
    const NEW_TITLE = 'Title test';

    component.title = NEW_TITLE;
    fixture.detectChanges();
    const titleEl = fixture.debugElement.query(By.css('.overlay-menu__title'));
    expect(titleEl.nativeElement.textContent).toBe(NEW_TITLE);
  });

  it('should display all menuItems', () => {
    const menuElItems = fixture.debugElement.queryAll(By.css('.overlay-menu__item'));
    expect(menuElItems.length).toEqual(component.menuItems.length);

    menuElItems.forEach((menuElItem, index) => {
      const inputMenuItem = component.menuItems[index];

      const imgEl = menuElItem.query(By.css('.overlay-menu__itemIcon'));
      expect(imgEl.nativeElement.src).toBe(`${location.protocol}//${location.host}${inputMenuItem.iconSrc}`);

      const textEl = menuElItem.query(By.css('.overlay-menu__actionText'));
      expect(textEl.nativeElement.textContent).toBe(inputMenuItem.actionText);
    });
  });

  it('should call actionFn and close on clicking one of the buttons', () => {
    const INDEX_ITEM = 0;
    const menuElItems = fixture.debugElement.parent.queryAll(By.css('.overlay-menu__item'));
    const inputMenuItem = component.menuItems[INDEX_ITEM];
    spyOn(inputMenuItem, 'actionFn');
    menuElItems[INDEX_ITEM].nativeElement.click();
    fixture.detectChanges();
    expect(component.isOpen).toBe(false);
    expect(inputMenuItem.actionFn).toHaveBeenCalled();
  });

  it('should set isOpen to false and emit isOpenChange false when calling closeOverlay', () => {
    component.isOpen = true;
    spyOn(component.isOpenChange, 'emit');
    component.closeOverlay();

    expect(component.isOpen).toBe(false);
    expect(component.isOpenChange.emit).toHaveBeenCalledWith(false);
  });
});
