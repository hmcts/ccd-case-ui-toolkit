import { Component, OnInit } from '@angular/core';
import { WindowService } from '../../../services/window';

const MEDIA_VIEWER = 'media-viewer';

@Component({
  selector: 'ccd-media-viewer',
  templateUrl: './media-viewer.component.html'
})
export class MediaViewerComponent implements OnInit {

  mediaURL: string = '';
  mediaFilename: string = '';
  mediaContentType: string = '';

  public constructor(private windowService: WindowService) {
  }

  ngOnInit() {
    const localstorageMedia = this.windowService.getLocalStorage(MEDIA_VIEWER);
    if (localstorageMedia) {
      const media = JSON.parse(localstorageMedia);
      this.mediaURL = media.document_binary_url;
      this.mediaFilename = media.document_filename;
      this.mediaContentType = media.content_type;
    }
    this.windowService.removeLocalStorage(MEDIA_VIEWER);
  }
}
