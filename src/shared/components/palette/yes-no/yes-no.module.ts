import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MarkdownModule } from '../../markdown/markdown.module';
import { PaletteUtilsModule } from '../utils/utils.module';
import { ReadYesNoFieldComponent } from './read-yes-no-field.component';
import { WriteYesNoFieldComponent } from './write-yes-no-field.component';
import { YesNoService } from './yes-no.service';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PaletteUtilsModule,
    MarkdownModule
  ],
  declarations: [
    ReadYesNoFieldComponent,
    WriteYesNoFieldComponent
  ],
  providers: [
    YesNoService
  ]
})
export class YesNoModule {}
