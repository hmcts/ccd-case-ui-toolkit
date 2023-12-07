import { OverlayModule } from '@angular/cdk/overlay';
import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { AbstractAppConfig } from '../../../../../../../app.config';
import { CaseFileViewOverlayMenuComponent } from '../../shared';
import { CaseFileViewFolderSortComponent } from './case-file-view-folder-sort.component';

describe('CaseFileViewFolderSortComponent', () => {
  let component: CaseFileViewFolderSortComponent;
  let fixture: ComponentFixture<CaseFileViewFolderSortComponent>;
  let overlayMenuButtons: DebugElement[];
  let mockAppConfig: any;

  beforeEach(async () => {
    mockAppConfig = jasmine.createSpyObj<AbstractAppConfig>('AbstractAppConfig', ['getEnableCaseFileViewVersion1_1']);
    await TestBed.configureTestingModule({
      declarations: [ CaseFileViewFolderSortComponent, CaseFileViewOverlayMenuComponent ],
      imports: [ OverlayModule ],
      providers: [{provide: AbstractAppConfig, useValue: mockAppConfig}]
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

  it('should have sort by upload date options if feature toggle is on', () => {
    mockAppConfig.getEnableCaseFileViewVersion1_1.and.returnValue(true);
    fixture.detectChanges();
    component.ngOnInit();
    expect(component.overlayMenuItems.length).toEqual(4);
  });

  it('should not have sort by upload date options if feature toggle is off', () => {
    mockAppConfig.getEnableCaseFileViewVersion1_1.and.returnValue(false);
    fixture.detectChanges();
    component.ngOnInit();
    expect(component.overlayMenuItems.length).toEqual(2);
  });
});
