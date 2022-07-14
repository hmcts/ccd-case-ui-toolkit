import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FormatTranslatorService } from '../../../services/case-fields/format-translator.service';
import { DatePipe } from '../utils';
import { PaletteUtilsModule } from '../utils/utils.module';
import { CaseHistoryViewerFieldComponent } from './case-history-viewer-field.component';
import { EventLogModule } from './event-log';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PaletteUtilsModule,
    EventLogModule,
  ],
  declarations: [
    CaseHistoryViewerFieldComponent
  ],
  entryComponents: [
    CaseHistoryViewerFieldComponent,
  ],
  providers: [
    DatePipe,
    FormatTranslatorService
  ]
})
export class CaseHistoryViewerModule {}
