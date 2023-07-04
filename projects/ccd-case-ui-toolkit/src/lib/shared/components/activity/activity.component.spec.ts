import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MockComponent } from 'ng2-mock-component';
import { Activity, DisplayMode } from '../../domain/activity/activity.model';
import { ActivityPollingService } from '../../services/activity/activity.polling.service';
import { MockRpxTranslatePipe } from '../../test/mock-rpx-translate.pipe';
import { ActivityComponent } from './activity.component';
import createSpyObj = jasmine.createSpyObj;

describe('CcdActivityComponent', () => {
  const BANNER: any = DisplayMode.BANNER;
  const ICON: any = DisplayMode.ICON;
  const CASE_ID = '1507217479821551';
  let activityPollingService: any;
  let fixture: ComponentFixture<ActivityComponent>;
  let component: ActivityComponent;
  let de: DebugElement;

  const ACTIVITY_WOUT_EDITOR_AND_VIEWER: Activity = {
    caseId: CASE_ID,
    editors: [],
    unknownEditors: 0,
    viewers: [],
    unknownViewers: 0
  };

  const ACTIVITY_W_EDITOR: Activity = {
    caseId: CASE_ID,
    editors: [{forename: 'Bob', surname: 'Ross'}],
    unknownEditors: 0,
    viewers: [],
    unknownViewers: 0
  };

  const ACTIVITY_W_MULTIPLE_EDITOR: Activity = {
    caseId: CASE_ID,
    editors: [{forename: 'Bob', surname: 'Ross'},
      {forename: 'William', surname: 'Orange'}],
    unknownEditors: 0,
    viewers: [],
    unknownViewers: 0
  };

  const ACTIVITY_W_UNKNOWN_EDITOR: Activity = {
    caseId: CASE_ID,
    editors: [],
    unknownEditors: 1,
    viewers: [],
    unknownViewers: 0
  };
  const ACTIVITY_W_VIEWER: Activity = {
    caseId: CASE_ID,
    editors: [],
    unknownEditors: 0,
    viewers: [{forename: 'Jamie', surname: 'Olivier'}],
    unknownViewers: 0
  };

  const ACTIVITY_W_MULTIPLE_VIEWER: Activity = {
    caseId: CASE_ID,
    editors: [],
    unknownEditors: 0,
    viewers: [{forename: 'Jamie', surname: 'Olivier'},
      {forename: 'William', surname: 'Orange'},
      {forename: 'Jon', surname: 'Doe'}],
    unknownViewers: 0
  };

  const ACTIVITY_W_UNKNOWN_VIEWER: Activity = {
    caseId: CASE_ID,
    editors: [],
    unknownEditors: 0,
    viewers: [],
    unknownViewers: 1
  };
  const ACTIVITY_W_BOTH: Activity = {
    caseId: CASE_ID,
    editors: [{forename: 'Bob', surname: 'Ross'}],
    unknownEditors: 0,
    viewers: [{forename: 'Jamie', surname: 'Olivier'}],
    unknownViewers: 1
  };

  const activityIconComponentMock: any = MockComponent({
    selector: 'ccd-activity-icon',
    inputs: ['description', 'imageLink']
  });

  const activityBannerComponentMock: any = MockComponent({
    selector: 'ccd-activity-banner',
    inputs: ['description', 'imageLink', 'bannerType']
  });

  beforeEach(waitForAsync(() => {
    activityPollingService = createSpyObj<any>('activityPollingService',
      ['subscribeToActivity', 'unsubscribeFromActivity', 'stopPolling']);
    activityPollingService.subscribeToActivity.and.returnValue();
    activityPollingService.unsubscribeFromActivity.and.returnValue();
    activityPollingService.isEnabled = true;
    TestBed
      .configureTestingModule({
        imports: [],
        declarations: [
          ActivityComponent,
					MockRpxTranslatePipe,
          // Mocks
          activityIconComponentMock,
          activityBannerComponentMock,
          MockRpxTranslatePipe
        ],
        providers: [
          {provide: ActivityPollingService, useValue: activityPollingService}
        ]
      })
      .compileComponents();

    fixture = TestBed.createComponent(ActivityComponent);
    fixture.detectChanges();

    component = fixture.componentInstance;
    component.caseId = CASE_ID;
    component.displayMode = BANNER;
    component.onActivityChange(ACTIVITY_W_VIEWER);
    de = fixture.debugElement;
    fixture.detectChanges();
  }));

  it('should render create when activity is disabled', () => {
    activityPollingService = fixture.debugElement.injector.get(ActivityPollingService);
    activityPollingService.isEnabled = false;
    fixture.detectChanges();
    const activityElement = de.query(By.css('.activityComponent'));

    expect(activityElement).toBeFalsy();
  });

  it('should render a case activity banner', () => {
    const banner = de.query(By.directive(activityBannerComponentMock));
    expect(activityPollingService.subscribeToActivity.toHaveBeenCalled);
    expect(banner).toBeTruthy();
  });

  it('should render single viewer banner', () => {
    const banner = de.queryAll(By.directive(activityBannerComponentMock));
    expect(banner).toBeTruthy();
    expect(banner.length).toEqual(1);
    expect(banner[0].componentInstance.bannerType).toBe('viewer');
  });

  it('should render single editor banner', () => {
    component.onActivityChange(ACTIVITY_W_EDITOR);
    fixture.detectChanges();
    const banner = de.queryAll(By.directive(activityBannerComponentMock));
    expect(banner).toBeTruthy();
    expect(banner.length).toEqual(1);
    expect(banner[0].componentInstance.bannerType).toBe('editor');
  });

  it('should render single editor banner FOR Unknown Editors', () => {
    component.onActivityChange(ACTIVITY_W_UNKNOWN_EDITOR);
    fixture.detectChanges();
    const banner = de.queryAll(By.directive(activityBannerComponentMock));
    expect(banner).toBeTruthy();
    expect(banner.length).toEqual(1);
    expect(banner[0].componentInstance.bannerType).toBe('editor');
  });

  it('should render single editor banner FOR Unknown Viewers', () => {
    component.onActivityChange(ACTIVITY_W_UNKNOWN_VIEWER);
    fixture.detectChanges();
    const banner = de.queryAll(By.directive(activityBannerComponentMock));
    expect(banner).toBeTruthy();
    expect(banner.length).toEqual(1);
    expect(banner[0].componentInstance.bannerType).toBe('viewer');
  });

  it('should render both banners', () => {
    component.onActivityChange(ACTIVITY_W_BOTH);
    fixture.detectChanges();
    const banner = de.queryAll(By.directive(activityBannerComponentMock));
    expect(banner).toBeTruthy();
    expect(banner.length).toEqual(2);
    expect(banner[0].componentInstance.bannerType).toBe('editor');
    expect(banner[1].componentInstance.bannerType).toBe('viewer');
  });

  it('should render single case VIEWER icon with the proper description', () => {
    component.displayMode = ICON;
    fixture.detectChanges();
    const icon = de.queryAll(By.directive(activityIconComponentMock));
    expect(icon).toBeTruthy();
    expect(icon[0].componentInstance.imageLink).toContain('viewer.png');
    expect(icon[0].componentInstance.description).toBe('Jamie Olivier is viewing this case');
  });

  it('should render multiple case VIEWER icon with the proper description', () => {
    component.displayMode = ICON;
    component.onActivityChange(ACTIVITY_W_MULTIPLE_VIEWER);
    fixture.detectChanges();
    const icon = de.queryAll(By.directive(activityIconComponentMock));
    expect(icon).toBeTruthy();
    expect(icon[0].componentInstance.imageLink).toContain('viewer.png');
    expect(icon[0].componentInstance.description).toBe('Jamie Olivier, William Orange and Jon Doe are viewing this case');
  });

  it('should render single case EDITOR icon with the proper description', () => {
    component.displayMode = ICON;
    component.onActivityChange(ACTIVITY_W_MULTIPLE_EDITOR);
    fixture.detectChanges();
    const icon = de.queryAll(By.directive(activityIconComponentMock));
    expect(icon).toBeTruthy();
    expect(icon[0].componentInstance.imageLink).toContain('editor.png');
    expect(icon[0].componentInstance.description).toBe('This case is being updated by Bob Ross and William Orange');
  });

  it('should render multiple case EDITOR icon with the proper description', () => {
    component.displayMode = ICON;
    component.onActivityChange(ACTIVITY_W_EDITOR);
    fixture.detectChanges();
    const icon = de.queryAll(By.directive(activityIconComponentMock));
    expect(icon).toBeTruthy();
    expect(icon[0].componentInstance.imageLink).toContain('editor.png');
    expect(icon[0].componentInstance.description).toBe('This case is being updated by Bob Ross');
  });

  it('should render both VIEWER & EDITOR icons', () => {
    component.displayMode = ICON;
    component.onActivityChange(ACTIVITY_W_BOTH);
    fixture.detectChanges();
    const icon = de.queryAll(By.directive(activityIconComponentMock));
    expect(icon).toBeTruthy();
    expect(icon[0].componentInstance.imageLink).toContain('editor.png');
    expect(icon[1].componentInstance.imageLink).toContain('viewer.png');
  });
});
