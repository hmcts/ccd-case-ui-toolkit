import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TabsComponent } from './tabs.component';
import { TabComponent } from './tab.component';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
  ],
  declarations: [
    TabsComponent,
    TabComponent,
  ],
  exports: [
    TabsComponent,
    TabComponent,
  ]
})
export class TabsModule {}
