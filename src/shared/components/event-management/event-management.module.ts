import { PortalModule } from '@angular/cdk/portal';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ComponentPortalExample1Component } from './component-portal-example1/component-portal-example1.component';
import { ComponentPortalExample2Component } from './component-portal-example2/component-portal-example2.component';
import { EventStartComponent } from './event-start/event-start.component';

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
  ]
})
export class EventManagementModule {}
