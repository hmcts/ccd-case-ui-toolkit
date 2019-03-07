import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventLogComponent } from './event-log.component';
import { EventLogTableComponent } from './event-log-table.component';
import { EventLogDetailsComponent } from './event-log-details.component';
import { RouterModule } from '@angular/router';
import { PaletteUtilsModule } from '../../utils';

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
