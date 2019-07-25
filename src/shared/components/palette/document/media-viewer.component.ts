import { Component, ElementRef, OnInit, Renderer2 } from '@angular/core';
import { WindowService } from '../../../services/window';

const MEDIA_VIEWER = 'media-viewer';

@Component({
  selector: 'ccd-media-viewer',
  templateUrl: './media-viewer.component.html'
})
export class MediaViewerComponent implements OnInit {

  mediaURL = '';
  mediaFilename = '';
  mediaContentType = '';

  public constructor(public renderer: Renderer2,
                     private el: ElementRef,
                     private windowService: WindowService) {
  }

  ngOnInit() {
    const localStorageMedia = this.windowService.getLocalStorage(MEDIA_VIEWER);
    if (localStorageMedia) {
      const media = JSON.parse(localStorageMedia);
      this.mediaURL = media.document_binary_url;
      this.mediaFilename = media.document_filename;
      this.mediaContentType = media.content_type;
    }
    this.windowService.removeLocalStorage(MEDIA_VIEWER);
    this.removeSideBar();
  }

  removeSideBar() {
    if (this.el.nativeElement) {
      let tempElement = this.el.nativeElement.parentElement
      while (tempElement) {
        if (tempElement.tagName === 'HTML') {
          this.renderer.setStyle(tempElement, 'background-color', '#ffffff');
        }
        tempElement = tempElement.parentElement;
      }
    }
  }
}
