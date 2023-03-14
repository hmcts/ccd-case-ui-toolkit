import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ActivityPollingService, ActivityService, ActivitySocketService, SessionStorageService } from '../../services';
import { ActivityBannerComponent } from './activity-banner';
import { ActivityIconComponent } from './activity-icon';
import { CaseActivityComponent } from './case-activity.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
  ],
  declarations: [
    ActivityBannerComponent,
    ActivityIconComponent,
    CaseActivityComponent,
  ],
  exports: [
    ActivityBannerComponent,
    ActivityIconComponent,
    CaseActivityComponent,
  ],
  providers: [
    ActivityService,
    ActivityPollingService,
    ActivitySocketService,
    SessionStorageService
  ]
})
export class ActivityModule {}
