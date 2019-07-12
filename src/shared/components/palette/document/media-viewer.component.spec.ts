import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MediaViewerComponent } from './media-viewer.component';
import { DocumentUrlPipe } from './document-url.pipe';
import { MediaViewerModule } from '@hmcts/media-viewer';
import createSpyObj = jasmine.createSpyObj;
import { WindowService } from '../../../services/window';
import { AbstractAppConfig } from '../../../../app.config';

describe('MediaViewerComponent', () => {
  let component: MediaViewerComponent;
  let fixture: ComponentFixture<MediaViewerComponent>;
  let windowService;
  let mockAppConfig: any;

  beforeEach(async(() => {
    mockAppConfig = createSpyObj<AbstractAppConfig>('AppConfig', ['getDocumentManagementUrl', 'getRemoteDocumentManagementUrl']);
    mockAppConfig.getDocumentManagementUrl.and.returnValue('hello-GATEWAY_DOCUMENT_URL');
    mockAppConfig.getRemoteDocumentManagementUrl.and.returnValue('hello-VALUE.document_binary_url');
    windowService = createSpyObj('windowService', ['setLocalStorage', 'getLocalStorage', 'removeLocalStorage']);
    TestBed.configureTestingModule({
      imports: [
        MediaViewerModule
      ],
      declarations: [
        MediaViewerComponent,
        DocumentUrlPipe
      ],
      providers: [
        { provide: AbstractAppConfig, useValue: mockAppConfig },
        { provide: WindowService, useValue: windowService }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MediaViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should load media viewer component', () => {
    expect(component).toBeTruthy();
  });
});
