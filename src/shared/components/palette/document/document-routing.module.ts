import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MediaViewerWrapperComponent } from './media-viewer-wrapper.component';

const routes: Routes = [
  {
    path: '',
    component: MediaViewerWrapperComponent
  }
];

export const DocumentRouting = RouterModule.forChild(routes);

@NgModule({
  imports: [DocumentRouting],
  exports: [RouterModule]
})
export class DocumentRoutingModule { }
