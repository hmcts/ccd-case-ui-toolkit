import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RpxTranslationModule } from 'rpx-xui-translation';
import { DefinitionsModule } from '../../services/definitions/definitions.module';
import { ErrorsModule } from '../error/errors.module';
import { CreateCaseFiltersComponent } from './create-case-filters.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        DefinitionsModule,
        ErrorsModule,
        RpxTranslationModule.forChild()
    ],
    declarations: [
        CreateCaseFiltersComponent
    ],
    exports: [
        CreateCaseFiltersComponent
    ]
})

export class CreateCaseFiltersModule {}
