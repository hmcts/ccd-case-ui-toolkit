import { OverlayModule } from '@angular/cdk/overlay';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { AbstractAppConfig } from '../../../../../../../app.config';
import { CaseFileViewOverlayMenuComponent } from '../../shared';
import { CaseFileViewFolderToggleComponent } from './case-file-view-folder-toggle.component';
import { WindowService } from '../../../../../../services';

describe("CaseFileViewFolderToggleComponent", () => {
  let component: CaseFileViewFolderToggleComponent;
  let fixture: ComponentFixture<CaseFileViewFolderToggleComponent>;
  let mockAppConfig: any;

  beforeEach(waitForAsync(() => {
    mockAppConfig = jasmine.createSpyObj<AbstractAppConfig>(
      "AbstractAppConfig",
      ["getEnableCaseFileViewVersion1_1"]
    );
    TestBed.configureTestingModule({
      declarations: [
        CaseFileViewFolderToggleComponent,
        CaseFileViewOverlayMenuComponent,
      ],
      imports: [OverlayModule],
      providers: [
        WindowService, { provide: AbstractAppConfig, useValue: mockAppConfig }
      ],
    }).compileComponents();
  }));

  beforeEach(waitForAsync(() => {
    fixture = TestBed.createComponent(CaseFileViewFolderToggleComponent);
    component = fixture.componentInstance;
    component.isOpen = true;
    fixture.detectChanges();
  }));

  it('should emit expandAll event when Expand All action is triggered', () => {
    spyOn(component.expandAll, 'emit');
    const expandAllAction = component.overlayMenuItems.find(item => item.actionText === 'Expand All');
    expandAllAction.actionFn();
    expect(component.expandAll.emit).toHaveBeenCalledWith(true);
  });

  it('should emit collapseAll event when Collapse All action is triggered', () => {
    spyOn(component.collapseAll, 'emit');
    const collapseAllAction = component.overlayMenuItems.find(item => item.actionText === 'Collapse All');
    collapseAllAction.actionFn();
    expect(component.collapseAll.emit).toHaveBeenCalledWith(true);
  });
});
