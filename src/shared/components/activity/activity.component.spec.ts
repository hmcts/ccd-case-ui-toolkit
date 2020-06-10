import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import createSpyObj = jasmine.createSpyObj;
import { ActivityComponent } from './activity.component';
import { DebugElement } from '@angular/core';
import { ActivityPollingService } from '../../services/activity/activity.polling.service';
import { MockComponent } from 'ng2-mock-component';
import { Activity, DisplayMode } from '../../domain/activity';

describe('CcdActivityComponent', () => {
  let BANNER: any = DisplayMode.BANNER;
  let ICON: any = DisplayMode.ICON;
  let CASE_ID = '1507217479821551';
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

  let ActivityIconComponent: any = MockComponent({
    selector: 'ccd-activity-icon',
    inputs: ['description', 'imageLink']
  });

  let ActivityBannerComponent: any = MockComponent({
    selector: 'ccd-activity-banner',
    inputs: ['description', 'imageLink', 'bannerType']
  });

  beforeEach(async(() => {
    activityPollingService = createSpyObj<any>('activityPollingService',
      ['subscribeToActivity', 'unsubscribeFromActivity']);
    activityPollingService.subscribeToActivity.and.returnValue();
    activityPollingService.unsubscribeFromActivity.and.returnValue();
    activityPollingService.isEnabled = true;
    TestBed
      .configureTestingModule({
        imports: [],
        declarations: [
          ActivityComponent,
          // Mocks
          ActivityIconComponent,
          ActivityBannerComponent
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
    let activityElement = de.query(By.css('.activityComponent'));

    expect(activityElement).toBeFalsy();
  });

  it('should render a case activity banner', () => {
    let banner = de.query(By.directive(ActivityBannerComponent));
    expect(activityPollingService.subscribeToActivity.toHaveBeenCalled);
    expect(banner).toBeTruthy();
  });

  it('should render single viewer banner', () => {
    let banner = de.queryAll(By.directive(ActivityBannerComponent));
    expect(banner).toBeTruthy();
    expect(banner.length).toEqual(1);
    expect(banner[0].componentInstance.bannerType).toBe('viewer');
  });

  it('should render single editor banner', () => {
    component.onActivityChange(ACTIVITY_W_EDITOR);
    fixture.detectChanges();
    let banner = de.queryAll(By.directive(ActivityBannerComponent));
    expect(banner).toBeTruthy();
    expect(banner.length).toEqual(1);
    expect(banner[0].componentInstance.bannerType).toBe('editor');
  });

  it('should render single editor banner FOR Unknown Editors', () => {
    component.onActivityChange(ACTIVITY_W_UNKNOWN_EDITOR);
    fixture.detectChanges();
    let banner = de.queryAll(By.directive(ActivityBannerComponent));
    expect(banner).toBeTruthy();
    expect(banner.length).toEqual(1);
    expect(banner[0].componentInstance.bannerType).toBe('editor');
  });

  it('should render single editor banner FOR Unknown Viewers', () => {
    component.onActivityChange(ACTIVITY_W_UNKNOWN_VIEWER);
    fixture.detectChanges();
    let banner = de.queryAll(By.directive(ActivityBannerComponent));
    expect(banner).toBeTruthy();
    expect(banner.length).toEqual(1);
    expect(banner[0].componentInstance.bannerType).toBe('viewer');
  });

  it('should render both banners', () => {
    component.onActivityChange(ACTIVITY_W_BOTH);
    fixture.detectChanges();
    let banner = de.queryAll(By.directive(ActivityBannerComponent));
    expect(banner).toBeTruthy();
    expect(banner.length).toEqual(2);
    expect(banner[0].componentInstance.bannerType).toBe('editor');
    expect(banner[1].componentInstance.bannerType).toBe('viewer');
  });

  it('should render single case VIEWER icon with the proper description', () => {
    component.displayMode = ICON;
    fixture.detectChanges();
    let icon = de.queryAll(By.directive(ActivityIconComponent));
    expect(icon).toBeTruthy();
    expect(icon[0].componentInstance.imageLink).toContain('viewer.png');
    expect(icon[0].componentInstance.description).toBe('Jamie Olivier is viewing this case');
  });

  it('should render multiple case VIEWER icon with the proper description', () => {
    component.displayMode = ICON;
    component.onActivityChange(ACTIVITY_W_MULTIPLE_VIEWER);
    fixture.detectChanges();
    let icon = de.queryAll(By.directive(ActivityIconComponent));
    expect(icon).toBeTruthy();
    expect(icon[0].componentInstance.imageLink).toContain('viewer.png');
    expect(icon[0].componentInstance.description).toBe('Jamie Olivier, William Orange and Jon Doe are viewing this case');
  });

  it('should render single case EDITOR icon with the proper description', () => {
    component.displayMode = ICON;
    component.onActivityChange(ACTIVITY_W_MULTIPLE_EDITOR);
    fixture.detectChanges();
    let icon = de.queryAll(By.directive(ActivityIconComponent));
    expect(icon).toBeTruthy();
    expect(icon[0].componentInstance.imageLink).toContain('editor.png');
    expect(icon[0].componentInstance.description).toBe('This case is being updated by Bob Ross and William Orange');
  });

  it('should render multiple case EDITOR icon with the proper description', () => {
    component.displayMode = ICON;
    component.onActivityChange(ACTIVITY_W_EDITOR);
    fixture.detectChanges();
    let icon = de.queryAll(By.directive(ActivityIconComponent));
    expect(icon).toBeTruthy();
    expect(icon[0].componentInstance.imageLink).toContain('editor.png');
    expect(icon[0].componentInstance.description).toBe('This case is being updated by Bob Ross');
  });

  it('should render both VIEWER & EDITOR icons', () => {
    component.displayMode = ICON;
    component.onActivityChange(ACTIVITY_W_BOTH);
    fixture.detectChanges();
    let icon = de.queryAll(By.directive(ActivityIconComponent));
    expect(icon).toBeTruthy();
    expect(icon[0].componentInstance.imageLink).toContain('editor.png');
    expect(icon[1].componentInstance.imageLink).toContain('viewer.png');
  });
});
