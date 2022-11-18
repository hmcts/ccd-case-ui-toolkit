import { plainToClass } from 'class-transformer';
import { DocumentTreeNode } from './document-tree-node.model';

describe('DocumentTreeNodeModel', () => {
  let documentTreeNode: DocumentTreeNode;

  beforeEach(() => {
    documentTreeNode = plainToClass(DocumentTreeNode, {
      name: 'Category A',
      type: 'category',
      children: [
        {
          name: 'Category B', type: 'category', children: [
            {name: 'Document E', type: 'document'},
            {name: 'Document G', type: 'document'},
            {name: 'Document F', type: 'document'},
          ]
        },
        {name: 'Category C', type: 'category'},
        {
          name: 'Category D', type: 'category', children: [
            {name: 'Document J', type: 'document'},
            {name: 'Document I', type: 'document'},
            {name: 'Document H', type: 'document'},
            {name: 'Document K', type: 'document'},
          ]
        },
        {name: 'Document C', type: 'document'},
        {name: 'Document B', type: 'document'},
        {name: 'Document A', type: 'document'},
        {name: 'Document D', type: 'document'},
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
      type: 'category',
      children: [
        {
          name: 'Category B', type: 'category', children: [
            {name: 'Document E', type: 'document'},
            {name: 'Document F', type: 'document'},
            {name: 'Document G', type: 'document'},
          ]
        },
        {name: 'Category C', type: 'category'},
        {
          name: 'Category D', type: 'category', children: [
            {name: 'Document H', type: 'document'},
            {name: 'Document I', type: 'document'},
            {name: 'Document J', type: 'document'},
            {name: 'Document K', type: 'document'},
          ]
        },
        {name: 'Document A', type: 'document'},
        {name: 'Document B', type: 'document'},
        {name: 'Document C', type: 'document'},
        {name: 'Document D', type: 'document'},
      ]
    });

    expect(documentTreeNode).toEqual(manuallySortedAscDocumentTreeNode);
  });

  it('should sort all documents alphabetically DESC and leave folders in the same position', () => {
    documentTreeNode.sortChildrenDescending();
    const manuallySortedDescDocumentTreeNode = plainToClass(DocumentTreeNode, {
      name: 'Category A',
      type: 'category',
      children: [
        {
          name: 'Category B', type: 'category', children: [
            {name: 'Document G', type: 'document'},
            {name: 'Document F', type: 'document'},
            {name: 'Document E', type: 'document'},
          ]
        },
        {name: 'Category C', type: 'category'},
        {
          name: 'Category D', type: 'category', children: [
            {name: 'Document K', type: 'document'},
            {name: 'Document J', type: 'document'},
            {name: 'Document I', type: 'document'},
            {name: 'Document H', type: 'document'},
          ]
        },
        {name: 'Document D', type: 'document'},
        {name: 'Document C', type: 'document'},
        {name: 'Document B', type: 'document'},
        {name: 'Document A', type: 'document'},
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
