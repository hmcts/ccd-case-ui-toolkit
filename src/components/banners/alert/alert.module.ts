import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AlertIconClassPipe } from './alert-icon-class.pipe';
import { AlertComponent } from './alert.component';

@NgModule({
  imports: [CommonModule],
  declarations: [
    AlertComponent,
    AlertIconClassPipe
  ],
  exports: [
    AlertComponent
  ]
})
export class AlertModule {}
