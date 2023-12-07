import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { BodyComponent } from './body.component';

@NgModule({
    imports: [CommonModule, RouterModule],
    declarations: [BodyComponent],
    exports: [BodyComponent]
})
export class BodyModule {}
