import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { PhaseComponent } from './phase/phase.component';
import { HeaderBarComponent } from './header-bar/header-bar.component';
import { NavigationComponent } from './navigation/navigation.component';
import { NavigationItemComponent } from './navigation/navigation-item.component';

@NgModule({
    imports: [CommonModule, RouterModule],
    declarations: [PhaseComponent, HeaderBarComponent, NavigationComponent, NavigationItemComponent],
    exports: [PhaseComponent, HeaderBarComponent, NavigationComponent, NavigationItemComponent]
})
export class HeadersModule {}
