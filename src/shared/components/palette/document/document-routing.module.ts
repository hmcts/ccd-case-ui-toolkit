import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MediaViewerComponent } from './media-viewer.component';

const routes: Routes = [
  {
    path: '',
    component: MediaViewerComponent
  }
];

export const DocumentRouting = RouterModule.forChild(routes);

@NgModule({
  imports: [DocumentRouting],
  exports: [RouterModule]
})
export class DocumentRoutingModule { }