import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';

import {BodyComponent} from './components/body/body.component';

@NgModule({
    imports: [CommonModule, RouterModule],
    declarations: [BodyComponent],
    exports: [BodyComponent]
})
export class BodyModule {}
