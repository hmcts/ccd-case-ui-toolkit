import { NgModule } from '@angular/core';
import { CreateCaseFiltersComponent } from './create-case-filters.component';
import { DefinitionsService } from '../../services/definitions/definitions.service';

@NgModule({
    imports: [
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
