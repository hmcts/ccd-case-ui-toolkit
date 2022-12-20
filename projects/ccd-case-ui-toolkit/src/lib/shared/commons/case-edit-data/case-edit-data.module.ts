import { ModuleWithProviders, NgModule } from '@angular/core';
import { CaseEditDataService } from './case-edit-data.service';

@NgModule({})
export class CaseEditDataModule {
    static forRoot(): ModuleWithProviders<CaseEditDataModule> {
        return {
            ngModule: CaseEditDataModule,
            providers: [CaseEditDataService],
        }
    }
}
