import { NgModule } from '@angular/core';
import { CreateCaseFiltersComponent } from './create-case-filters.component';
import { CommonModule } from '@angular/common';
import { ErrorsModule } from '../error/errors.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { DefinitionsService } from '../../services';

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
    ],
    providers: [
        DefinitionsService
    ]
})

export class CreateCaseFiltersModule {}
