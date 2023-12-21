import { plainToClass } from 'class-transformer';
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
            {name: 'Document E', type: 'document'},
            {name: 'Document G', type: 'document'},
            {name: 'Document F', type: 'document'},
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

  it('should sort all documents alphabetically ASC and leave folders in the same position', () => {
    documentTreeNode.sortChildrenAscending();
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

  it('should sort all documents alphabetically DESC and leave folders in the same position', () => {
    documentTreeNode.sortChildrenDescending();
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
