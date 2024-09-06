import { CdkTreeModule } from '@angular/cdk/tree';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { plainToClass } from 'class-transformer';
import { of } from 'rxjs';
import { AbstractAppConfig } from '../../../../../../app.config';
import { CaseFileViewSortColumns, DocumentTreeNode, DocumentTreeNodeType } from '../../../../../domain/case-file-view';
import { DocumentManagementService, FormatTranslatorService, WindowService } from '../../../../../services';
import { mockDocumentManagementService } from '../../../../../services/document-management/document-management.service.mock';
import { categoriesAndDocumentsTestData } from '../../test-data/categories-and-documents-test-data';
import {
  categorisedTreeData,
  treeData,
  treeDataSortedAlphabeticallyAsc,
  treeDataSortedAlphabeticallyDesc,
  uncategorisedTreeData
} from '../../test-data/document-tree-node-test-data';
import { CaseFileViewFolderComponent, MEDIA_VIEWER_LOCALSTORAGE_KEY } from './case-file-view-folder.component';
import createSpyObj = jasmine.createSpyObj;
import { DatePipe } from '../../../utils'
import moment from 'moment-timezone';

describe('CaseFileViewFolderComponent', () => {
  let component: CaseFileViewFolderComponent;
  let fixture: ComponentFixture<CaseFileViewFolderComponent>;
  let nativeElement: any;
  let mockAppConfig: any;

  const documentsTreeNodes: DocumentTreeNode[] = plainToClass(DocumentTreeNode, [
    {
      name: 'Lager encyclopedia',
      type: DocumentTreeNodeType.DOCUMENT,
      document_filename: 'Lager encyclopedia',
      document_binary_url: '/test/binary',
      attribute_path: '',
      upload_timestamp: '2023-05-11T11:15:10.00'
    },
    {
      name: 'Beers encyclopedia',
      type: DocumentTreeNodeType.DOCUMENT,
      document_filename: 'Beers encyclopedia',
      document_binary_url: '/test/binary',
      attribute_path: '',
      upload_timestamp: '2023-04-14T15:30:00.00'
    },
    {
      name: 'Ale encyclopedia',
      type: DocumentTreeNodeType.DOCUMENT,
      document_filename: 'Ale encyclopedia',
      document_binary_url: '/test/binary',
      attribute_path: '',
      upload_timestamp: '2023-03-12T01:23:01.00'
    }
  ]);

  beforeEach(waitForAsync(() => {
    const mockWindowService = createSpyObj<WindowService>('WindowService', ['setLocalStorage', 'openOnNewTab']);
    mockAppConfig = jasmine.createSpyObj<AbstractAppConfig>('AbstractAppConfig', ['getEnableCaseFileViewVersion1_1']);
    mockAppConfig.getEnableCaseFileViewVersion1_1.and.returnValue(true);
    TestBed.configureTestingModule({
      imports: [
        CdkTreeModule,
        ReactiveFormsModule,
        RouterTestingModule,
        MatDialogModule
      ],
      declarations: [
        CaseFileViewFolderComponent,
        DatePipe
      ],
      providers: [
        { provide: WindowService, useValue: mockWindowService },
        { provide: DocumentManagementService, useValue: mockDocumentManagementService },
        { provide: AbstractAppConfig, useValue: mockAppConfig },
        FormatTranslatorService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CaseFileViewFolderComponent);
    component = fixture.componentInstance;
    component.categoriesAndDocuments = of(categoriesAndDocumentsTestData);
    nativeElement = fixture.debugElement.nativeElement;
    fixture.detectChanges();
  }));

  it('should create', async() => {
    spyOn(component, 'filter').and.returnValue(of([]));
    const documentFilterInputEl = nativeElement.querySelector('.document-search');
    documentFilterInputEl.dispatchEvent(new Event('focusin'));
    documentFilterInputEl.value = 'enc';
    documentFilterInputEl.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await fixture.whenStable();
    component.sortDataSourceDescending(1)
    fixture.detectChanges();
    expect(component.filter).toHaveBeenCalled();

    expect(treeData[3].children[0].upload_timestamp).toEqual('2022-11-17T00:00:00.00');
  });

  it('should generate tree data from categorised data', () => {
    expect(component.generateTreeData(categoriesAndDocumentsTestData.categories)).toEqual(categorisedTreeData);
  });

  it('should get documents from category with upload timestamp when feature toggle is on', () => {
    const documents = categoriesAndDocumentsTestData.categories[0].documents;
    fixture.detectChanges();
    expect(component.getDocuments(documents)).toEqual(documentsTreeNodes);
  });

  it('should get uncategorised documents', () => {
    expect(component.getUncategorisedDocuments(categoriesAndDocumentsTestData.uncategorised_documents)).toEqual(uncategorisedTreeData);
  });

  it('should render cdk nested tree and verify the timestamp values', () => {
    component.nestedDataSource = treeData;
    fixture.detectChanges();
    const documentTreeContainerEl = nativeElement.querySelector('.document-tree-container');
    expect(documentTreeContainerEl).toBeDefined();
    const timestampElements = nativeElement.querySelectorAll('.node__document-upload-timestamp');
    // const diff = new Date().getTimezoneOffset();
    // console.log('Difference:-', diff);
    // console.log('Result:-', moment(new Date(timestampElements[3].textContent).getTime() - diff * 60 * 1000).format('DD MMM YYYY HH:mm:ss'));
    console.log('Input date:-', categoriesAndDocumentsTestData.categories[0].documents[0].upload_timestamp);
    console.log('Result new:-', convertUTCDateToLocalDate(categoriesAndDocumentsTestData.categories[0].documents[0].upload_timestamp));
    // console.log('Result new1:-', new Date(categoriesAndDocumentsTestData.categories[0].documents[0].upload_timestamp));
    expect(timestampElements[0].textContent).toEqual('11 May 2023 12:15');
    // expect(timestampElements[0].textContent).toEqual('11 May 2023 12:15');
    // expect(timestampElements[1].textContent).toEqual('14 Apr 2023 16:30');
    // expect(timestampElements[2].textContent).toEqual('12 Mar 2023 01:23');
    // expect(timestampElements[3].textContent).toEqual('');
    // expect(timestampElements[4].textContent).toEqual('10 Feb 2023 00:00');
    // expect(timestampElements[5].textContent).toEqual('12 Apr 2023 01:00');
    // expect(timestampElements[6].textContent).toEqual('16 Mar 2023 00:00');
    // expect(timestampElements[7].textContent).toEqual('21 Jun 2022 01:00');
    // expect(timestampElements[8].textContent).toEqual('04 Nov 2022 00:00');
    // expect(timestampElements[9].textContent).toEqual('28 Dec 2022 00:00');
    // expect(timestampElements[10].textContent).toEqual('17 Nov 2022 00:00');
    // expect(timestampElements[11].textContent).toEqual('23 Feb 2023 00:00');
  });

  function calculateHourOffset(dateString: Date| string): number {
    // Determine the local time zone dynamically
    const localTimeZone = moment.tz.guess();
    console.log(`Detected Local Time Zone: ${localTimeZone}`);
    // Create a Moment object from the date string in UTC
    const utcDate = moment.tz(dateString, 'UTC');
    console.log('Original UTC Date:', utcDate.format());
    // Convert the UTC date to the local time zone
    const localDate = utcDate.clone().tz(localTimeZone);
    console.log(`Converted to Local Time (${localTimeZone}):`, localDate.format());
    // Determine the offset in minutes between UTC and the local time zone
    const offsetMinutes = localDate.utcOffset();
    console.log(`UTC Offset for ${localTimeZone}: ${offsetMinutes} minutes`);
    // Convert the offset from minutes to hours
    const offsetHours = offsetMinutes / 60;
    console.log(`Offset in Hours: ${offsetHours}`);
    return offsetHours;
  }
  function convertUTCDateToLocalDate(dateInput: Date | string): string {
    // const diff = dateInput ? new Date(dateInput).getTimezoneOffset() : 0;
    // console.log('convertUTCDateToLocalDate Date:-', new Date());
    // console.log('convertUTCDateToLocalDate diff:-', diff)
    const dateValue = new Date(dateInput);
    return dateInput ? moment(dateValue.getTime() - dateValue.getTimezoneOffset() * 60 * 1000).format('DD MMM YYYY HH:mm:ss') : '';
  }
  it('should call sortChildrenAscending on all children of nestedDataSource when calling sortDataSourceAscAlphabetically', () => {
    const sortChildrenAscendingSpies = [];
    component.nestedDataSource.forEach((item) => {
      sortChildrenAscendingSpies.push(spyOn(item, 'sortChildrenAscending').and.callThrough());
    });

    component.sortDataSourceAscending(CaseFileViewSortColumns.DOCUMENT_NAME);
    fixture.detectChanges();

    sortChildrenAscendingSpies.forEach((item) => {
      expect(item).toHaveBeenCalled();
    });
    expect(component.nestedDataSource).toEqual(treeDataSortedAlphabeticallyAsc);
  });

  it('should call sortChildrenDescending on all children of nestedDataSource when calling sortDataSourceDescAlphabetically', () => {
    const sortChildrenDescendingSpies = [];
    component.nestedDataSource.forEach((item) => {
      sortChildrenDescendingSpies.push(spyOn(item, 'sortChildrenDescending').and.callThrough());
    });
    component.sortDataSourceDescending(CaseFileViewSortColumns.DOCUMENT_NAME);
    fixture.detectChanges();

    sortChildrenDescendingSpies.forEach((item) => {
      expect(item).toHaveBeenCalled();
    });

    expect(component.nestedDataSource).toEqual(treeDataSortedAlphabeticallyDesc);
  });

  it('should set mediaViewer localStorage' +
    'and open in a new tab using windowService when calling triggerDocumentAction with actionType: openInANewTab', () => {
      const documentTreeNode = component.nestedDataSource[0].children[3];
      component.triggerDocumentAction('openInANewTab', documentTreeNode);

      // @ts-expect-error -- private method
      expect(component.windowService.setLocalStorage).toHaveBeenCalledWith(
        MEDIA_VIEWER_LOCALSTORAGE_KEY,
        // @ts-expect-error -- private method
        component.documentManagementService.getMediaViewerInfo({
          document_binary_url: documentTreeNode.document_binary_url,
          document_filename: documentTreeNode.document_filename
        })
      );

      // @ts-expect-error -- private method
      expect(component.windowService.openOnNewTab).toHaveBeenCalledWith('/media-viewer');
    });

  it('should display correct folder icons', () => {
    component.nestedDataSource = treeData;
    fixture.detectChanges();
    const documentTreeContainerEl = nativeElement.querySelector('.document-tree-container');
    const firstNodeButton = documentTreeContainerEl.querySelector('.node');
    const iconEl = firstNodeButton.querySelector('.node__iconImg');
    expect(iconEl.getAttribute('src')).toEqual('/assets/images/folder.png');
    firstNodeButton.click();
    fixture.detectChanges();
    expect(iconEl.getAttribute('src')).toEqual('/assets/images/folder-open.png');
  });

  it('should filter documents', () => {
    const filteredTreeData: DocumentTreeNode[] = plainToClass(DocumentTreeNode, [
      {
        name: 'Spirits',
        type: DocumentTreeNodeType.FOLDER,
        children: [
          {
            name: 'Scotch whisky',
            type: DocumentTreeNodeType.FOLDER,
            children: [
              {
                name: 'Lowland',
                type: DocumentTreeNodeType.FOLDER,
                children: [
                  {
                    name: 'Lowland 1',
                    type: DocumentTreeNodeType.FOLDER,
                    children: [
                      {
                        name: 'Details about Whisky Lowland 1',
                        type: DocumentTreeNodeType.DOCUMENT
                      }
                    ]
                  }
                ]
              },
              {
                name: 'Islay',
                type: DocumentTreeNodeType.FOLDER,
                children: [
                  {
                    name: 'Details about Whisky Islay',
                    type: DocumentTreeNodeType.DOCUMENT
                  },
                  {
                    name: 'More information about Whisky Islay',
                    type: DocumentTreeNodeType.DOCUMENT
                  }
                ]
              }
            ]
          }
        ]
      }
    ]);
    component.documentTreeData = filteredTreeData;
    component.documentSearchFormControl.setValue('abo');
    component.filter('abo').subscribe(result => {
      expect(result).toEqual(filteredTreeData);
    });
  });

  it('should filter documents no match', () => {
    component.documentTreeData = plainToClass(DocumentTreeNode, [
      {
        name: 'Spirits',
        type: DocumentTreeNodeType.FOLDER,
        children: [
          {
            name: 'Scotch whisky',
            type: DocumentTreeNodeType.FOLDER,
            children: [
              {
                name: 'Lowland',
                type: DocumentTreeNodeType.FOLDER,
                children: [
                  {
                    name: 'Lowland 1',
                    type: DocumentTreeNodeType.FOLDER,
                    children: [
                      {
                        name: 'Details about Whisky Lowland 1',
                        type: DocumentTreeNodeType.DOCUMENT
                      }
                    ]
                  }
                ]
              },
              {
                name: 'Islay',
                type: DocumentTreeNodeType.FOLDER,
                children: [
                  {
                    name: 'Details about Whisky Islay',
                    type: DocumentTreeNodeType.DOCUMENT
                  },
                  {
                    name: 'More information about Whisky Islay',
                    type: DocumentTreeNodeType.DOCUMENT
                  }
                ]
              }
            ]
          }
        ]
      }
    ]);
    component.documentSearchFormControl.setValue('some random text');
    component.filter('some random text').subscribe(result => {
      expect(result.length).toEqual(0);
    });
  });

  it('should filter documents verify UI', async() => {
    component.nestedDataSource = treeData;
    fixture.detectChanges();
    const documentFilterInputEl = nativeElement.querySelector('.document-search');
    documentFilterInputEl.dispatchEvent(new Event('focusin'));
    documentFilterInputEl.value = 'enc';
    documentFilterInputEl.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const documentTreeContainerEl = nativeElement.querySelector('.document-tree-container');
    expect(documentTreeContainerEl.textContent).toContain('Beers encyclopedia');
  });

  it('should filter documents no match verify UI', async() => {
    component.nestedDataSource = treeData;
    fixture.detectChanges();
    const documentFilterInputEl = nativeElement.querySelector('.document-search');
    documentFilterInputEl.dispatchEvent(new Event('focusin'));
    documentFilterInputEl.value = 'some random text';
    documentFilterInputEl.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const documentTreeContainerEl = nativeElement.querySelector('.document-tree-container');
    expect(documentTreeContainerEl.textContent).toContain('No results found');
  });

  it('should get all document count as get documentCount', () => {
    expect(component.documentCount).toEqual(12);
  });

  it('should emit clickedDocument when clicking a node that is of type document', () => {
    spyOn(component.clickedDocument, 'emit');
    const firstNodeOfTypeDocument = fixture.debugElement.query(By.css('.document-tree-container__node--document'));
    const nodeButton = firstNodeOfTypeDocument.query(By.css('.node'));
    nodeButton.nativeElement.click();

    expect(component.clickedDocument.emit).toHaveBeenCalled();
  });

  it('should set selectedItem and set class "node--selected" when clicking a node that is of type document', () => {
    const firstNodeOfTypeDocument = fixture.debugElement.query(By.css('.document-tree-container__node--document'));
    const nodeButton = firstNodeOfTypeDocument.query(By.css('.node'));
    nodeButton.nativeElement.click();
    fixture.detectChanges();

    expect(component.selectedNodeItem).toBeDefined();
    expect(nodeButton.nativeElement.classList).toContain('node--selected');
  });

  it('should unsubscribe', () => {
    spyOn(component.categoriesAndDocumentsSubscription, 'unsubscribe').and.callThrough();
    spyOn(component.documentFilterSubscription, 'unsubscribe').and.callThrough();
    component.ngOnDestroy();
    expect(component.categoriesAndDocumentsSubscription.unsubscribe).toHaveBeenCalled();
    expect(component.documentFilterSubscription.unsubscribe).toHaveBeenCalled();
  });

  it('should call the printDocument function when the triggerDocumentAction function is called with actionType "document"', () => {
    const documentTreeNode = {
      name: 'Test',
      type: DocumentTreeNodeType.DOCUMENT,
      document_filename: 'Document1.pdf',
      document_binary_url: 'http://dummy.hmcts.net/documents/8c464dd2-b7d6-4929-a909-8109875b6c26/binary'
    } as DocumentTreeNode;
    spyOn(component, 'printDocument').and.callThrough();
    const fakeWindow = createSpyObj('window', ['print']);
    spyOn(window, 'open').and.returnValue(fakeWindow);
    component.triggerDocumentAction('print', documentTreeNode);
    expect(component.printDocument).toHaveBeenCalledWith('/documents/8c464dd2-b7d6-4929-a909-8109875b6c26/binary');
    expect(window.open).toHaveBeenCalled();
    expect(fakeWindow.print).toHaveBeenCalled();
  });

  it('should call the downloadFile function when the triggerDocumentAction function is called with actionType "download"', () => {
    const documentTreeNode = {
      name: 'Test',
      type: DocumentTreeNodeType.DOCUMENT,
      document_filename: 'Document1.pdf',
      document_binary_url: 'http://dummy.hmcts.net/documents/8c464dd2-b7d6-4929-a909-8109875b6c26/binary'
    } as DocumentTreeNode;
    spyOn(component, 'downloadFile').and.callThrough();
    const fakeAnchorElement = createSpyObj('a', ['setAttribute', 'click', 'remove']);
    fakeAnchorElement.href = null;
    fakeAnchorElement.download = null;
    spyOn(document, 'createElement').and.returnValue(fakeAnchorElement);
    spyOn(document.body, 'appendChild');
    component.triggerDocumentAction('download', documentTreeNode);
    expect(component.downloadFile).toHaveBeenCalledWith('/documents/8c464dd2-b7d6-4929-a909-8109875b6c26/binary', 'Document1.pdf');
    expect(document.createElement).toHaveBeenCalledWith('a');
    expect(document.body.appendChild).toHaveBeenCalledWith(fakeAnchorElement);
    expect(fakeAnchorElement.setAttribute).toHaveBeenCalledWith('style', 'display: none');
    expect(fakeAnchorElement.href).toEqual('/documents/8c464dd2-b7d6-4929-a909-8109875b6c26/binary');
    expect(fakeAnchorElement.download).toEqual('Document1.pdf');
    expect(fakeAnchorElement.click).toHaveBeenCalled();
    expect(fakeAnchorElement.remove).toHaveBeenCalled();
  });

  it('should get documents from category without upload timestamp when feature toggle is off', () => {
    const documents = categoriesAndDocumentsTestData.categories[0].documents;
    mockAppConfig.getEnableCaseFileViewVersion1_1.and.returnValue(false);
    fixture.detectChanges();
    documentsTreeNodes.forEach((n) => n.upload_timestamp = '');
    expect(component.getDocuments(documents)).toEqual(documentsTreeNodes);
  });

  it('should get uncategorised documents', () => {
    mockAppConfig.getEnableCaseFileViewVersion1_1.and.returnValue(false);
    fixture.detectChanges();
    uncategorisedTreeData.children.forEach((c) => c.upload_timestamp = '');
    expect(component.getUncategorisedDocuments(categoriesAndDocumentsTestData.uncategorised_documents)).toEqual(uncategorisedTreeData);
  });
});
