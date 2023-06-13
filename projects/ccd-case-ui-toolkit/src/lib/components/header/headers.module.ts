import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { RpxTranslationModule } from 'rpx-xui-translation';
import { HeaderBarComponent } from './header-bar/header-bar.component';
import { NavigationItemComponent } from './navigation/navigation-item.component';
import { NavigationComponent } from './navigation/navigation.component';
import { PhaseComponent } from './phase/phase.component';
import { RpxTranslationModule } from 'rpx-xui-translation';

@NgModule({
    imports: [CommonModule, RouterModule, RpxTranslationModule.forChild()],
    declarations: [PhaseComponent, HeaderBarComponent, NavigationComponent, NavigationItemComponent],
    exports: [PhaseComponent, HeaderBarComponent, NavigationComponent, NavigationItemComponent]
})
export class HeadersModule {}
