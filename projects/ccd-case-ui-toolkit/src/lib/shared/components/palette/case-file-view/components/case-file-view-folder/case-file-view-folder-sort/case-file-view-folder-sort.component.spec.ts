import { OverlayModule } from '@angular/cdk/overlay';
import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { CaseFileViewOverlayMenuComponent } from '../../shared';
import { CaseFileViewFolderSortComponent } from './case-file-view-folder-sort.component';

describe('CaseFileViewFolderSortComponent', () => {
  let component: CaseFileViewFolderSortComponent;
  let fixture: ComponentFixture<CaseFileViewFolderSortComponent>;
  let overlayMenuButtons: DebugElement[];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaseFileViewFolderSortComponent, CaseFileViewOverlayMenuComponent ],
      imports: [ OverlayModule ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaseFileViewFolderSortComponent);
    component = fixture.componentInstance;
    component.isOpen = true;
    fixture.detectChanges();
    overlayMenuButtons = fixture.debugElement.queryAll(By.css('.overlay-menu__item'));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit sortAscending on clicking "A to Z descending" button', () => {
    spyOn(component.sortAscending, 'emit');
    overlayMenuButtons[0].nativeElement.click();
    expect(component.sortAscending.emit).toHaveBeenCalled();
  });

  it('should emit sortDescending on clicking "Z to A descending" button', () => {
    spyOn(component.sortDescending, 'emit');
    overlayMenuButtons[1].nativeElement.click();
    expect(component.sortDescending.emit).toHaveBeenCalled();
  });
});
