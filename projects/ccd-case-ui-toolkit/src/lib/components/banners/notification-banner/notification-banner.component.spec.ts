import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NotificationBannerType } from './enums';
import { NotificationBannerComponent } from './notification-banner.component';

describe('NotificationBannerComponent', () => {
  let component: NotificationBannerComponent;
  let fixture: ComponentFixture<NotificationBannerComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [NotificationBannerComponent]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NotificationBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display information banner', () => {
    component.notificationBannerConfig = {
      bannerType: NotificationBannerType.INFORMATION,
      headingText: 'Important',
      description: 'There are 4 active flags on this case.',
      showLink: true,
      linkText: 'View case flags',
      linkUrl: '/case/ddd',
      headerClass: 'notification-banner-information'
    };
    fixture.detectChanges();
    const notificationBannerElement = fixture.debugElement.nativeElement.querySelector('.govuk-notification-banner');
    expect(notificationBannerElement.textContent).toContain('Important');
    expect(notificationBannerElement.getAttribute('class')).toContain('notification-banner-information');
  });

  it('should display warning banner', () => {
    component.notificationBannerConfig = {
      bannerType: NotificationBannerType.WARNING,
      headingText: 'Warning',
      description: 'There are 4 active flags on this case.',
      showLink: false,
      headerClass: 'notification-banner-warning'
    };
    fixture.detectChanges();
    const notificationBannerElement = fixture.debugElement.nativeElement.querySelector('.govuk-notification-banner');
    expect(notificationBannerElement.textContent).toContain('Warning');
    expect(notificationBannerElement.getAttribute('class')).toContain('notification-banner-warning');
  });

  it('should display error banner', () => {
    component.notificationBannerConfig = {
      bannerType: NotificationBannerType.ERROR,
      headingText: 'Error',
      description: 'There are 4 active flags on this case.',
      showLink: false,
      headerClass: 'notification-banner-error'
    };
    fixture.detectChanges();
    const notificationBannerElement = fixture.debugElement.nativeElement.querySelector('.govuk-notification-banner');
    expect(notificationBannerElement.textContent).toContain('Error');
    expect(notificationBannerElement.getAttribute('class')).toContain('notification-banner-error');
  });

  it('should display success banner', () => {
    component.notificationBannerConfig = {
      bannerType: NotificationBannerType.SUCCESS,
      headingText: 'Success',
      description: 'There are 4 active flags on this case.',
      showLink: true,
      linkText: 'View case flags',
      linkUrl: '/case/ddd',
      headerClass: 'notification-banner-success'
    };
    fixture.detectChanges();
    const notificationBannerElement = fixture.debugElement.nativeElement.querySelector('.govuk-notification-banner');
    expect(notificationBannerElement.textContent).toContain('Success');
    expect(notificationBannerElement.getAttribute('class')).toContain('notification-banner-success');
  });
});
