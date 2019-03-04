import { NgModule } from '@angular/core';
import { CreateCaseFiltersComponent } from './create-case-filters.component';
import { CommonModule } from '@angular/common';
import { ErrorsModule } from '../error/errors.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

@NgModule({
    imports: [
        CommonModule,
        ErrorsModule,
        FormsModule,
        ReactiveFormsModule
    ],
    declarations: [
        CreateCaseFiltersComponent
    ],
    exports: [
        CreateCaseFiltersComponent
    ]
})

export class CreateCaseFiltersModule {}
