import { PortalModule } from '@angular/cdk/portal';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { EventCompletionComponent } from './event-completion.component';
import { EventCompletionStateMachineService } from './services';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PortalModule,
    RouterModule
  ],
  declarations: [
    EventCompletionComponent
  ],
  providers: [
    EventCompletionStateMachineService
  ],
  exports: [
    EventCompletionComponent
  ]
})
export class EventCompletionModule {}
