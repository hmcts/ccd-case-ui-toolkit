import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DefinitionsModule } from '../../services';
import { ErrorsModule } from '../error/errors.module';
import { CreateCaseFiltersComponent } from './create-case-filters.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        DefinitionsModule,
        ErrorsModule,
    ],
    declarations: [
        CreateCaseFiltersComponent
    ],
    exports: [
        CreateCaseFiltersComponent
    ]
})

export class CreateCaseFiltersModule {}
