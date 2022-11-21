import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CaseFileViewOverlayMenuComponent } from './case-file-view-overlay-menu.component';

describe('CaseFileViewOverlayMenuComponent', () => {
  let component: CaseFileViewOverlayMenuComponent;
  let fixture: ComponentFixture<CaseFileViewOverlayMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaseFileViewOverlayMenuComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaseFileViewOverlayMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set isTrue to false and emit isOpenChange false when calling closeOverlay', () => {
    component.isOpen = true;
    spyOn(component.isOpenChange, 'emit');
    component.closeOverlay();

    expect(component.isOpen).toBe(false);
    expect(component.isOpenChange.emit).toHaveBeenCalledWith(false);
  });
});
