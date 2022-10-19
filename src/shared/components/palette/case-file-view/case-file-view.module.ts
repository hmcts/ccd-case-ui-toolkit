import { NgModule } from "@angular/core";
import { AngularSplitModule } from "angular-split";
import { CaseFileViewFieldComponent } from "./case-file-view-field.component";

@NgModule({
  imports: [
    AngularSplitModule
  ],
  declarations: [
    CaseFileViewFieldComponent
  ],
  entryComponents: [
    CaseFileViewFieldComponent
  ],
  exports: [
    CaseFileViewFieldComponent
  ]
})
export class CaseFileViewModule {}
