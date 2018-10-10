import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FieldReadComponent } from './field-read.component';
import { ReactiveFormsModule } from '@angular/forms';
import { FieldWriteComponent } from './field-write.component';
import { FieldReadLabelComponent } from './field-read-label.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ],
  declarations: [
    FieldReadComponent,
    FieldWriteComponent,
    FieldReadLabelComponent,
  ],
  exports: [
    FieldReadComponent,
    FieldWriteComponent,
  ]
})
export class BaseFieldModule {}
