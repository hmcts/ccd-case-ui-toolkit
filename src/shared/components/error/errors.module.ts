import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CallbackErrorsComponent } from './callback-errors.component';

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
    ],
    declarations: [
        CallbackErrorsComponent
    ],
    exports: [
        CallbackErrorsComponent,
    ]
})
export class ErrorsModule {}
