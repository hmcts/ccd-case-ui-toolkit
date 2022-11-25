import { plainToClass } from 'class-transformer';
import { DocumentTreeNode, DocumentTreeNodeType } from '../../../../domain/case-file-view';

export const treeData: DocumentTreeNode[] = plainToClass(DocumentTreeNode, [
  {
    name: 'Beers',
    type: DocumentTreeNodeType.FOLDER,
    children: [
      {
        name: 'Bitters',
        type: DocumentTreeNodeType.FOLDER,
        children: []
      },
      {
        name: 'American',
        type: DocumentTreeNodeType.FOLDER,
        children: []
      },
      {
        name: 'Asian',
        type: DocumentTreeNodeType.FOLDER,
        children: []
      },
      {
        name: 'Lager encyclopedia',
        type: DocumentTreeNodeType.DOCUMENT,
        document_filename: 'Lager encyclopedia',
        document_binary_url: '/test/binary'
      },
      {
        name: 'Beers encyclopedia',
        type: DocumentTreeNodeType.DOCUMENT,
        document_filename: 'Beers encyclopedia',
        document_binary_url: '/test/binary'
      },
      {
        name: 'Ale encyclopedia',
        type: DocumentTreeNodeType.DOCUMENT,
        document_filename: 'Ale encyclopedia',
        document_binary_url: '/test/binary'
      },
    ]
  },
  {
    name: 'Wines',
    type: DocumentTreeNodeType.FOLDER,
    children: [
      {
        name: 'French',
        type: DocumentTreeNodeType.FOLDER,
        children: []
      },
      {
        name: 'Italian',
        type: DocumentTreeNodeType.FOLDER,
        children: []
      }
    ]
  },
  {
    name: 'Spirits',
    type: DocumentTreeNodeType.FOLDER,
    children: [
      {
        name: 'Scotch whisky',
        type: DocumentTreeNodeType.FOLDER,
        children: [
          {
            name: 'Highland',
            type: DocumentTreeNodeType.FOLDER,
            children: [
              {
                name: 'Highland 1',
                type: DocumentTreeNodeType.FOLDER,
                children: []
              }
            ]
          },
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
                    type: DocumentTreeNodeType.DOCUMENT,
                    document_filename: 'Details about Whisky Lowland 1',
                    document_binary_url: '/test/binary'
                  }
                ]
              },
              {
                name: 'Lowland 2',
                type: DocumentTreeNodeType.FOLDER,
                children: []
              }
            ]
          },
          {
            name: 'Islay',
            type: DocumentTreeNodeType.FOLDER,
            children: [
              {
                name: 'Details about Whisky Islay',
                type: DocumentTreeNodeType.DOCUMENT,
                document_filename: 'Details about Whisky Islay',
                document_binary_url: '/test/binary'
              },
              {
                name: 'More information about Whisky Islay',
                type: DocumentTreeNodeType.DOCUMENT,
                document_filename: 'More information about Whisky Islay',
                document_binary_url: '/test/binary'
              }
            ]
          },
          {
            name: 'Speyside',
            type: DocumentTreeNodeType.FOLDER,
            children: []
          },
          {
            name: 'Campbeltown',
            type: DocumentTreeNodeType.FOLDER,
            children: []
          }
        ]
      }
    ]
  }
]);

export const treeDataWithUncategorisedDocuments: DocumentTreeNode[] = plainToClass(DocumentTreeNode, [
  {
    name: 'Beers',
    type: DocumentTreeNodeType.FOLDER,
    children: [
      {
        name: 'Bitters',
        type: DocumentTreeNodeType.FOLDER,
        children: []
      },
      {
        name: 'American',
        type: DocumentTreeNodeType.FOLDER,
        children: []
      },
      {
        name: 'Asian',
        type: DocumentTreeNodeType.FOLDER,
        children: []
      },
      {
        name: 'Lager encyclopedia',
        type: DocumentTreeNodeType.DOCUMENT,
        document_filename: 'Lager encyclopedia',
        document_binary_url: '/test/binary'
      },
      {
        name: 'Beers encyclopedia',
        type: DocumentTreeNodeType.DOCUMENT,
        document_filename: 'Beers encyclopedia',
        document_binary_url: '/test/binary'
      },
      {
        name: 'Ale encyclopedia',
        type: DocumentTreeNodeType.DOCUMENT,
        document_filename: 'Ale encyclopedia',
        document_binary_url: '/test/binary'
      }
    ]
  },
  {
    name: 'Wines',
    type: DocumentTreeNodeType.FOLDER,
    children: [
      {
        name: 'French',
        type: DocumentTreeNodeType.FOLDER,
        children: []
      },
      {
        name: 'Italian',
        type: DocumentTreeNodeType.FOLDER,
        children: []
      }
    ]
  },
  {
    name: 'Spirits',
    type: DocumentTreeNodeType.FOLDER,
    children: [
      {
        name: 'Scotch whisky',
        type: DocumentTreeNodeType.FOLDER,
        children: [
          {
            name: 'Highland',
            type: DocumentTreeNodeType.FOLDER,
            children: [
              {
                name: 'Highland 1',
                type: DocumentTreeNodeType.FOLDER,
                children: []
              }
            ]
          },
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
                    type: DocumentTreeNodeType.DOCUMENT,
                    document_filename: 'Details about Whisky Lowland 1',
                    document_binary_url: '/test/binary'
                  }
                ]
              },
              {
                name: 'Lowland 2',
                type: DocumentTreeNodeType.FOLDER,
                children: []
              }
            ]
          },
          {
            name: 'Islay',
            type: DocumentTreeNodeType.FOLDER,
            children: [
              {
                name: 'Details about Whisky Islay',
                type: DocumentTreeNodeType.DOCUMENT,
                document_filename: 'Details about Whisky Islay',
                document_binary_url: '/test/binary'
              },
              {
                name: 'More information about Whisky Islay',
                type: DocumentTreeNodeType.DOCUMENT,
                document_filename: 'More information about Whisky Islay',
                document_binary_url: '/test/binary'
              }
            ]
          },
          {
            name: 'Speyside',
            type: DocumentTreeNodeType.FOLDER,
            children: []
          },
          {
            name: 'Campbeltown',
            type: DocumentTreeNodeType.FOLDER,
            children: []
          }
        ]
      }
    ]
  },
  {
    name: 'Uncategorised documents',
    type: DocumentTreeNodeType.FOLDER,
    children: [
      {
        name: 'Uncategorised document 1',
        type: DocumentTreeNodeType.DOCUMENT,
        document_filename: 'Uncategorised document 1',
        document_binary_url: '/test/binary'
      },
      {
        name: 'Uncategorised document 2',
        type: DocumentTreeNodeType.DOCUMENT,
        document_filename: 'Uncategorised document 2',
        document_binary_url: '/test/binary'
      }
    ]
  }
]);
