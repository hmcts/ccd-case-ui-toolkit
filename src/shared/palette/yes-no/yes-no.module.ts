import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReadYesNoFieldComponent } from './read-yes-no-field.component';
import { YesNoService } from './yes-no.service';
import { WriteYesNoFieldComponent } from './write-yes-no-field.component';
import { ReactiveFormsModule } from '@angular/forms';
import { PaletteUtilsModule } from '../utils/utils.module';
import { MarkdownModule } from '../../markdown/markdown.module';

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
  entryComponents: [
    ReadYesNoFieldComponent,
    WriteYesNoFieldComponent
  ],
  providers: [
    YesNoService
  ]
})
export class YesNoModule {}
