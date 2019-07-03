import { Component, OnInit } from '@angular/core';
import { WindowService } from '../../../services/window';

@Component({
  selector: 'ccd-doc-viewer',
  templateUrl: './doc-viewer.component.html'
})
export class DocViewerComponent implements OnInit {

  document: any;

  public constructor(private windowService: WindowService) {
  }

  ngOnInit() {
    this.document = JSON.parse(this.windowService.getLocalStorage('DOC_VIEWER'));
    this.windowService.removeLocalStorage('DOC_VIEWER');
  }
}
