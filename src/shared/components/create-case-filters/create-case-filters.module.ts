import { NgModule } from '@angular/core';
import { CreateCaseFiltersComponent } from './create-case-filters.component';
import { CommonModule } from '@angular/common';
import { ErrorsModule } from '../error/errors.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { DefinitionsServiceModule } from '../../services';

@NgModule({
    imports: [
        CommonModule,
        ErrorsModule,
        FormsModule,
        ReactiveFormsModule,
        DefinitionsServiceModule
    ],
    declarations: [
        CreateCaseFiltersComponent
    ],
    exports: [
        CreateCaseFiltersComponent
    ]
})

export class CreateCaseFiltersModule {}
