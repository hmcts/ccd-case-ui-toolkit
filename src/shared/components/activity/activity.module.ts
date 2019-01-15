import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ActivityService, ActivityPollingService } from '../../services';
import { ActivityComponent } from './activity.component';
import { ActivityBannerComponent } from './activity-banner';
import { ActivityIconComponent } from './activity-icon';

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
    ]
})
export class ActivityModule {}
