import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OverlayModule } from '@angular/cdk/overlay';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { CaseFileViewOverlayMenuComponent } from '../../shared';
import { CaseFileViewFolderDocumentActionsComponent } from './case-file-view-folder-document-actions.component';

describe('CaseFileViewFolderDocumentActionsComponent', () => {
  let component: CaseFileViewFolderDocumentActionsComponent;
  let fixture: ComponentFixture<CaseFileViewFolderDocumentActionsComponent>;
  let overlayMenuButtons: DebugElement[];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaseFileViewFolderDocumentActionsComponent, CaseFileViewOverlayMenuComponent ],
      imports: [ OverlayModule ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaseFileViewFolderDocumentActionsComponent);
    component = fixture.componentInstance;
    component.isOpen = true;
    component.allowMoving = true;
    fixture.detectChanges();
    overlayMenuButtons = fixture.debugElement.queryAll(By.css('.overlay-menu__item'));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit changeFolderAction on clicking "Change folder" button', () => {
    spyOn(component.changeFolderAction, 'emit');
    overlayMenuButtons[0].nativeElement.click();
    expect(component.changeFolderAction.emit).toHaveBeenCalled();
  });

  it('should emit openInANewTabAction on clicking "Open in a new tab" button', () => {
    spyOn(component.openInANewTabAction, 'emit');
    overlayMenuButtons[1].nativeElement.click();
    expect(component.openInANewTabAction.emit).toHaveBeenCalled();
  });

  it('should emit downloadAction on clicking "Download" button', () => {
    spyOn(component.downloadAction, 'emit');
    overlayMenuButtons[2].nativeElement.click();
    expect(component.downloadAction.emit).toHaveBeenCalled();
  });

  it('should emit printAction on clicking "Print" button', () => {
    spyOn(component.printAction, 'emit');
    overlayMenuButtons[3].nativeElement.click();
    expect(component.printAction.emit).toHaveBeenCalled();
  });
});
