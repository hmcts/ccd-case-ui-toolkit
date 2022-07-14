import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ConditionalShowModule } from '../../../directives/conditional-show';
import { FocusElementModule } from '../../../directives/focus-element';
import { OrganisationConverter } from '../../../domain/organisation';
import { OrganisationService } from '../../../services/organisation';
import { WindowService } from '../../../services/window';
import { MarkdownModule } from '../../markdown';
import { BaseFieldModule } from '../base-field/base-field.module';
import { ComplexModule } from '../complex';
import { PaletteUtilsModule } from '../utils';
import { ReadOrganisationFieldRawComponent } from './read-organisation-field-raw.component';
import { ReadOrganisationFieldTableComponent } from './read-organisation-field-table.component';
import { ReadOrganisationFieldComponent } from './read-organisation-field.component';
import { WriteOrganisationComplexFieldComponent } from './write-organisation-complex-field.component';
import { WriteOrganisationFieldComponent } from './write-organisation-field.component';

@NgModule({
  imports: [
    ConditionalShowModule,
    CommonModule,
    ComplexModule,
    ReactiveFormsModule,
    MarkdownModule,
    PaletteUtilsModule,
    FocusElementModule,
    BaseFieldModule
  ],
  declarations: [
    ReadOrganisationFieldComponent,
    ReadOrganisationFieldTableComponent,
    ReadOrganisationFieldRawComponent,
    WriteOrganisationFieldComponent,
    WriteOrganisationComplexFieldComponent
  ],
  exports: [
    ReadOrganisationFieldComponent,
    ReadOrganisationFieldTableComponent,
    ReadOrganisationFieldRawComponent,
    WriteOrganisationFieldComponent,
    WriteOrganisationComplexFieldComponent
  ],
  providers: [
    OrganisationService,
    OrganisationConverter,
    WindowService
  ]
})
export class OrganisationModule {}
