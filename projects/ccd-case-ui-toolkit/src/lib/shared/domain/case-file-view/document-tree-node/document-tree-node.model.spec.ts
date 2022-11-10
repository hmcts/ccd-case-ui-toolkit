import { plainToClass } from 'class-transformer';
import { DocumentTreeNode } from './document-tree-node.model';
describe('DocumentTreeNodeModel', () => {
  let documentTreeNode: DocumentTreeNode;

  beforeEach(() => {
    documentTreeNode = plainToClass(DocumentTreeNode, {
      name: 'name',
      type: 'document',
      children: [
        { name: 'Document 1', type: 'document' },
        { name: 'Document 2', type: 'document' },
        { name: 'Document 3', type: 'document' },
        { name: 'Document 4', type: 'document' },
        { name: 'Category 1', type: 'category', children: [
            { name: 'Document 5', type: 'document' },
            { name: 'Document 6', type: 'document', children: [
                { name: 'Document 7', type: 'document' },
              ]
            },
          ]
        },
        { name: 'Category 2', type: 'category' },
        { name: 'Category 2', type: 'category', children: [
            { name: 'Document 8', type: 'document' },
          ]
        }
      ]
    });
  });

  it('should have the childDocumentCount property that is a count of all documents', () => {
    expect(documentTreeNode.childDocumentCount).toBe(8);
  });
});
