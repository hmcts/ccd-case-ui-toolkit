import { NgModule } from '@angular/core';
import { CreateCaseFiltersComponent } from './create-case-filters.component';
import { DefinitionsService } from '../../services/definitions/definitions.service';
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
    ],
    providers: [
        DefinitionsService
    ]
})

export class CreateCaseFiltersModule {}
