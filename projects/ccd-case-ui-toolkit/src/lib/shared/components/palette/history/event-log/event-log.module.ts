import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PaletteUtilsModule } from '../../utils';
import { EventLogDetailsComponent } from './event-log-details.component';
import { EventLogTableComponent } from './event-log-table.component';
import { EventLogComponent } from './event-log.component';

@NgModule({
  imports: [
    CommonModule,
    PaletteUtilsModule,
    RouterModule
  ],
  declarations: [
    EventLogComponent,
    EventLogTableComponent,
    EventLogDetailsComponent
  ],
  exports: [
    EventLogComponent
  ]
})
export class EventLogModule {}
