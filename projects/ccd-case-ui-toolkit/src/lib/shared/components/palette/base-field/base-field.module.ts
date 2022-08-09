import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FieldReadLabelComponent } from './field-read-label.component';
import { FieldReadComponent } from './field-read.component';
import { FieldWriteComponent } from './field-write.component';

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
