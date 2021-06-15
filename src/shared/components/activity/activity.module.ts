import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { ActivityPollingService, ActivityService, ActivitySocketService } from '../../services';
import { SessionStorageService } from '../../services/session/session-storage.service';
import { ActivityBannerComponent } from './activity-banner';
import { ActivityIconComponent } from './activity-icon';
import { ActivityComponent } from './activity.component';

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
    ],
    declarations: [
        ActivityComponent,
        ActivityBannerComponent,
        ActivityIconComponent,
    ],
    exports: [
        ActivityComponent,
        ActivityBannerComponent,
        ActivityIconComponent,
    ],
    providers: [
        ActivityService,
        ActivityPollingService,
        ActivitySocketService,
        SessionStorageService
    ]
})
export class ActivityModule {}
