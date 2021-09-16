import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComponentPortalExample1Component, ComponentPortalExample2Component, EventStartComponent } from './event-start.component';
import { PortalModule } from '@angular/cdk/portal';

@NgModule({
  imports: [
    CommonModule,
    PortalModule
  ],
  declarations: [
    EventStartComponent,
    ComponentPortalExample1Component,
    ComponentPortalExample2Component
  ],
  entryComponents: [
    EventStartComponent,
    ComponentPortalExample1Component,
    ComponentPortalExample2Component
  ],
  exports: [
    EventStartComponent,
    ComponentPortalExample1Component,
    ComponentPortalExample2Component
  ]
})
export class EventStartComponentModule {}
