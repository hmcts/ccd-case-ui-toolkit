import { plainToClass } from 'class-transformer';
import { SortOrder } from '../../sort-order.enum';
import { CaseFileViewSortColumns } from '../case-file-view-sort-columns.enum';
import { DocumentTreeNodeType } from './document-tree-node-type.model';
import { DocumentTreeNode } from './document-tree-node.model';

describe('DocumentTreeNodeModel', () => {
  let documentTreeNode: DocumentTreeNode;

  beforeEach(() => {
    documentTreeNode = plainToClass(DocumentTreeNode, {
      name: 'Category A',
      type: DocumentTreeNodeType.FOLDER,
      children: [
        {
          name: 'Category B', type: DocumentTreeNodeType.FOLDER, children: [
            {name: 'Document E', type: DocumentTreeNodeType.DOCUMENT},
            {name: 'Document G', type: DocumentTreeNodeType.DOCUMENT},
            {name: 'Document F', type: DocumentTreeNodeType.DOCUMENT},
          ]
        },
        {
          name: 'Category D', type: DocumentTreeNodeType.FOLDER, children: [
						{name: 'Document J', type: DocumentTreeNodeType.DOCUMENT},
            {name: 'Document I', type: DocumentTreeNodeType.DOCUMENT},
						{name: 'Document H', type: DocumentTreeNodeType.DOCUMENT},
            {name: 'Document K', type: DocumentTreeNodeType.DOCUMENT},
          ]
        },
        {name: 'Category C', type: DocumentTreeNodeType.FOLDER},
				{name: 'Document C', type: DocumentTreeNodeType.DOCUMENT},
        {name: 'Document B', type: DocumentTreeNodeType.DOCUMENT},
				{name: 'Document A', type: DocumentTreeNodeType.DOCUMENT},
        {name: 'Document D', type: DocumentTreeNodeType.DOCUMENT},
      ]
    });
  });

  it('should have the childDocumentCount property that is a count of all documents', () => {
    expect(documentTreeNode.childDocumentCount).toBe(11);
  });

  it('should sort all documents by name ASC and leave folders in the same position', () => {
    documentTreeNode.sortChildrenAscending(CaseFileViewSortColumns.DOCUMENT_NAME, SortOrder.ASCENDING);
    const manuallySortedAscDocumentTreeNode = plainToClass(DocumentTreeNode, {
      name: 'Category A',
      type: DocumentTreeNodeType.FOLDER,
			children: [
        {
          name: 'Category B', type: DocumentTreeNodeType.FOLDER, children: [
            {name: 'Document E', type: DocumentTreeNodeType.DOCUMENT},
            {name: 'Document F', type: DocumentTreeNodeType.DOCUMENT},
            {name: 'Document G', type: DocumentTreeNodeType.DOCUMENT},
          ]
        },
        {
          name: 'Category D', type: DocumentTreeNodeType.FOLDER, children: [
            {name: 'Document H', type: DocumentTreeNodeType.DOCUMENT},
            {name: 'Document I', type: DocumentTreeNodeType.DOCUMENT},
            {name: 'Document J', type: DocumentTreeNodeType.DOCUMENT},
            {name: 'Document K', type: DocumentTreeNodeType.DOCUMENT},
          ]
        },
        {name: 'Category C', type: DocumentTreeNodeType.FOLDER},
        {name: 'Document A', type: DocumentTreeNodeType.DOCUMENT},
        {name: 'Document B', type: DocumentTreeNodeType.DOCUMENT},
        {name: 'Document C', type: DocumentTreeNodeType.DOCUMENT},
        {name: 'Document D', type: DocumentTreeNodeType.DOCUMENT},
      ]
    });

    expect(documentTreeNode).toEqual(manuallySortedAscDocumentTreeNode);
  });

  it('should sort all documents by name DESC and leave folders in the same position', () => {
    documentTreeNode.sortChildrenDescending(CaseFileViewSortColumns.DOCUMENT_NAME, SortOrder.DESCENDING);
    const manuallySortedDescDocumentTreeNode = plainToClass(DocumentTreeNode, {
      name: 'Category A',
      type: DocumentTreeNodeType.FOLDER,
      children: [
        {
          name: 'Category B', type: DocumentTreeNodeType.FOLDER, children: [
            {name: 'Document G', type: DocumentTreeNodeType.DOCUMENT},
            {name: 'Document F', type: DocumentTreeNodeType.DOCUMENT},
            {name: 'Document E', type: DocumentTreeNodeType.DOCUMENT},
          ]
        },
        {
          name: 'Category D', type: DocumentTreeNodeType.FOLDER, children: [
            {name: 'Document K', type: DocumentTreeNodeType.DOCUMENT},
            {name: 'Document J', type: DocumentTreeNodeType.DOCUMENT},
            {name: 'Document I', type: DocumentTreeNodeType.DOCUMENT},
            {name: 'Document H', type: DocumentTreeNodeType.DOCUMENT},
          ]
        },
        {name: 'Category C', type: DocumentTreeNodeType.FOLDER},
        {name: 'Document D', type: DocumentTreeNodeType.DOCUMENT},
        {name: 'Document C', type: DocumentTreeNodeType.DOCUMENT},
        {name: 'Document B', type: DocumentTreeNodeType.DOCUMENT},
        {name: 'Document A', type: DocumentTreeNodeType.DOCUMENT},
      ]
    });

    expect(documentTreeNode).toEqual(manuallySortedDescDocumentTreeNode);
  });

  it('should get all children of children nodes (i.e. flattened) as flattenedAll', () => {
    const flattenedAll = documentTreeNode.flattenedAll;

    expect(flattenedAll).toContain(documentTreeNode.children[1]);
    expect(flattenedAll).toContain(documentTreeNode.children[0].children[0]);
  });
});

describe('DocumentTreeNodeModel - Sort by upload timestamp', () => {
  let documentTreeNode: DocumentTreeNode;

  beforeEach(() => {
    documentTreeNode = plainToClass(DocumentTreeNode, {
      name: 'Category A',
      type: DocumentTreeNodeType.FOLDER,
      children: [
        {
          name: 'Category B', type: DocumentTreeNodeType.FOLDER, children: [
            {name: 'Document E', upload_timestamp: '11 Jun 2023', type: DocumentTreeNodeType.DOCUMENT},
            {name: 'Document G', upload_timestamp: '14 Apr 2023', type: DocumentTreeNodeType.DOCUMENT},
            {name: 'Document F', upload_timestamp: '12 Mar 2023', type: DocumentTreeNodeType.DOCUMENT},
          ]
        },
        {
          name: 'Category D', type: DocumentTreeNodeType.FOLDER, children: [
						{name: 'Document J', upload_timestamp: '18 Dec 2022', type: DocumentTreeNodeType.DOCUMENT},
            {name: 'Document I', upload_timestamp: '28 Jul 2022', type: DocumentTreeNodeType.DOCUMENT},
						{name: 'Document H', upload_timestamp: '01 Nov 2022', type: DocumentTreeNodeType.DOCUMENT},
            {name: 'Document K', upload_timestamp: '23 Aug 2022', type: DocumentTreeNodeType.DOCUMENT},
          ]
        },
        {name: 'Category C', type: DocumentTreeNodeType.FOLDER},
				{name: 'Document C', upload_timestamp: '19 Feb 2023', type: DocumentTreeNodeType.DOCUMENT},
        {name: 'Document B', upload_timestamp: '12 Jan 2023', type: DocumentTreeNodeType.DOCUMENT},
				{name: 'Document A', upload_timestamp: '17 Feb 2023', type: DocumentTreeNodeType.DOCUMENT},
        {name: 'Document D', upload_timestamp: '16 Jan 2023', type: DocumentTreeNodeType.DOCUMENT},
      ]
    });
  });

	it('should sort all documents by upload timestamp ASC and leave folders in the same position', () => {
    documentTreeNode.sortChildrenAscending(CaseFileViewSortColumns.DOCUMENT_UPLOAD_TIMESTAMP, SortOrder.ASCENDING);
    const manuallySortedAscDocumentTreeNode = plainToClass(DocumentTreeNode, {
      name: 'Category A',
      type: DocumentTreeNodeType.FOLDER,
      children: [
        {
          name: 'Category B', type: DocumentTreeNodeType.FOLDER, children: [
            {name: 'Document F', upload_timestamp: '12 Mar 2023', type: DocumentTreeNodeType.DOCUMENT},
            {name: 'Document G', upload_timestamp: '14 Apr 2023', type: DocumentTreeNodeType.DOCUMENT},
            {name: 'Document E', upload_timestamp: '11 Jun 2023', type: DocumentTreeNodeType.DOCUMENT},
          ]
        },
        {
          name: 'Category D', type: DocumentTreeNodeType.FOLDER, children: [
            {name: 'Document I', upload_timestamp: '28 Jul 2022', type: DocumentTreeNodeType.DOCUMENT},
            {name: 'Document K', upload_timestamp: '23 Aug 2022', type: DocumentTreeNodeType.DOCUMENT},
            {name: 'Document H', upload_timestamp: '01 Nov 2022', type: DocumentTreeNodeType.DOCUMENT},
            {name: 'Document J', upload_timestamp: '18 Dec 2022', type: DocumentTreeNodeType.DOCUMENT},
          ]
        },
        {name: 'Category C', type: DocumentTreeNodeType.FOLDER},
        {name: 'Document B', upload_timestamp: '12 Jan 2023', type: DocumentTreeNodeType.DOCUMENT},
        {name: 'Document D', upload_timestamp: '16 Jan 2023', type: DocumentTreeNodeType.DOCUMENT},
        {name: 'Document A', upload_timestamp: '17 Feb 2023', type: DocumentTreeNodeType.DOCUMENT},
        {name: 'Document C', upload_timestamp: '19 Feb 2023', type: DocumentTreeNodeType.DOCUMENT},
      ]
    });

    expect(documentTreeNode).toEqual(manuallySortedAscDocumentTreeNode);
  });

  it('should sort all documents by upload timestamp DESC and leave folders in the same position', () => {
    documentTreeNode.sortChildrenDescending(CaseFileViewSortColumns.DOCUMENT_UPLOAD_TIMESTAMP, SortOrder.DESCENDING);
    const manuallySortedDescDocumentTreeNode = plainToClass(DocumentTreeNode, {
      name: 'Category A',
      type: DocumentTreeNodeType.FOLDER,
      children: [
        {
          name: 'Category B', type: DocumentTreeNodeType.FOLDER, children: [
            {name: 'Document E', upload_timestamp: '11 Jun 2023', type: DocumentTreeNodeType.DOCUMENT},
            {name: 'Document G', upload_timestamp: '14 Apr 2023', type: DocumentTreeNodeType.DOCUMENT},
            {name: 'Document F', upload_timestamp: '12 Mar 2023', type: DocumentTreeNodeType.DOCUMENT},
          ]
        },
        {
          name: 'Category D', type: DocumentTreeNodeType.FOLDER, children: [
            {name: 'Document J', upload_timestamp: '18 Dec 2022', type: DocumentTreeNodeType.DOCUMENT},
            {name: 'Document H', upload_timestamp: '01 Nov 2022', type: DocumentTreeNodeType.DOCUMENT},
            {name: 'Document K', upload_timestamp: '23 Aug 2022', type: DocumentTreeNodeType.DOCUMENT},
            {name: 'Document I', upload_timestamp: '28 Jul 2022', type: DocumentTreeNodeType.DOCUMENT},
          ]
        },
        {name: 'Category C', type: DocumentTreeNodeType.FOLDER},
        {name: 'Document C', upload_timestamp: '19 Feb 2023', type: DocumentTreeNodeType.DOCUMENT},
        {name: 'Document A', upload_timestamp: '17 Feb 2023', type: DocumentTreeNodeType.DOCUMENT},
        {name: 'Document D', upload_timestamp: '16 Jan 2023', type: DocumentTreeNodeType.DOCUMENT},
        {name: 'Document B', upload_timestamp: '12 Jan 2023', type: DocumentTreeNodeType.DOCUMENT},
      ]
    });

    expect(documentTreeNode).toEqual(manuallySortedDescDocumentTreeNode);
  });
});