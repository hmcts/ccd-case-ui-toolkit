import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { PaletteUtilsModule } from '../utils';
import { ReadOrganisationFieldTableComponent } from './read-organisation-field-table.component';
import { WriteOrganisationFieldComponent } from './write-organisation-field.component';
import { ComplexModule } from '../complex';
import { MarkdownModule } from '../../markdown';
import { ConditionalShowModule } from '../../../directives/conditional-show';
import { FocusElementModule } from '../../../directives/focus-element';
import { WriteOrganisationComplexFieldComponent } from './write-organisation-complex-field.component';
import { BaseFieldModule } from '../base-field/base-field.module';
import { ReadOrganisationFieldComponent } from './read-organisation-field.component';
import { ReadOrganisationFieldRawComponent } from './read-organisation-field-raw.component';
import { OrganisationConverter } from '../../../domain/organisation';
import { OrganisationService } from '../../../services/organisation';
import { WindowService } from '../../../services/window';

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
