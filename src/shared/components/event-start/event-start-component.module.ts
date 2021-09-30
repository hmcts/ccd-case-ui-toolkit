import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventStartComponent } from './event-start.component';
import { PortalModule } from '@angular/cdk/portal';

@NgModule({
  imports: [
    CommonModule,
    PortalModule
  ],
  declarations: [
    EventStartComponent
  ],
  entryComponents: [
    EventStartComponent
  ]
})
export class EventStartComponentModule {}
