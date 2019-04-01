import { NgModule } from '@angular/core';
import { CaseHistoryViewerFieldComponent } from './case-history-viewer-field.component';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { PaletteUtilsModule } from '../utils/utils.module';
import { EventLogModule } from './event-log';
import { DatePipe } from '../utils';

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
    DatePipe
  ]
})
export class CaseHistoryViewerModule {}
