import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { PhaseComponent } from './components/phase/phase.component';
import { HeaderComponent } from './components/header/header.component';
import { NavigationComponent } from './components/navigation/navigation.component';
import { NavigationItemComponent } from './components/navigation/navigation-item.component';

@NgModule({
    imports: [CommonModule, RouterModule],
    declarations: [PhaseComponent, HeaderComponent, NavigationComponent, NavigationItemComponent],
    exports: [PhaseComponent, HeaderComponent, NavigationComponent, NavigationItemComponent]
})
export class HeadersModule {}
