import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertComponent } from './alert.component';
import { AlertIconClassPipe } from './alert-icon-class.pipe';

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
