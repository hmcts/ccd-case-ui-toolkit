import { plainToClass } from 'class-transformer';
import { DocumentTreeNode, DocumentTreeNodeType } from '../../../../domain/case-file-view/document-tree-node.model';

export const categorisedTreeData: DocumentTreeNode[] = plainToClass(DocumentTreeNode, [
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
        type: 'document'
      },
      {
        name: 'Beers encyclopedia',
        type: 'document'
      },
      {
        name: 'Ale encyclopedia',
        type: 'document'
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
                type: 'category',
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
                    type: 'document'
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
                type: 'document'
              },
              {
                name: 'More information about Whisky Islay',
                type: 'document'
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

export const uncategorisedTreeData: DocumentTreeNode = plainToClass(DocumentTreeNode, {
  name: 'Uncategorised documents',
  type: 'category',
  children: [
    {
      name: 'Uncategorised document 1',
      type: 'document'
    },
    {
      name: 'Uncategorised document 2',
      type: 'document'
    }
  ]
});

export const treeData = [
  ...categorisedTreeData,
  uncategorisedTreeData
];

export const treeDataSortedAlphabeticallyAsc: DocumentTreeNode[] = plainToClass(DocumentTreeNode, [
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
        name: 'Ale encyclopedia',
        type: DocumentTreeNodeType.DOCUMENT
      },
      {
        name: 'Beers encyclopedia',
        type: DocumentTreeNodeType.DOCUMENT
      },
      {
        name: 'Lager encyclopedia',
        type: DocumentTreeNodeType.DOCUMENT
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
                    type: DocumentTreeNodeType.DOCUMENT
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
                type: DocumentTreeNodeType.DOCUMENT
              },
              {
                name: 'More information about Whisky Islay',
                type: DocumentTreeNodeType.DOCUMENT
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

export const treeDataSortedAlphabeticallyDesc: DocumentTreeNode[] = plainToClass(DocumentTreeNode, [
  {
    name: 'Beers',
    type: 'category',
    children: [
      {
        name: 'Bitters',
        type: 'category',
        children: []
      },
      {
        name: 'American',
        type: 'category',
        children: []
      },
      {
        name: 'Asian',
        type: 'category',
        children: []
      },
      {
        name: 'Lager encyclopedia',
        type: 'document'
      },
      {
        name: 'Beers encyclopedia',
        type: 'document'
      },
      {
        name: 'Ale encyclopedia',
        type: 'document'
      },
    ]
  },
  {
    name: 'Wines',
    type: 'category',
    children: [
      {
        name: 'French',
        type: 'category',
        children: []
      },
      {
        name: 'Italian',
        type: 'category',
        children: []
      }
    ]
  },
  {
    name: 'Spirits',
    type: 'category',
    children: [
      {
        name: 'Scotch whisky',
        type: 'category',
        children: [
          {
            name: 'Highland',
            type: 'category',
            children: [
              {
                name: 'Highland 1',
                type: 'category',
                children: []
              }
            ]
          },
          {
            name: 'Lowland',
            type: 'category',
            children: [
              {
                name: 'Lowland 1',
                type: 'category',
                children: [
                  {
                    name: 'Details about Whisky Lowland 1',
                    type: 'document'
                  }
                ]
              },
              {
                name: 'Lowland 2',
                type: 'category',
                children: []
              }
            ]
          },
          {
            name: 'Islay',
            type: 'category',
            children: [
              {
                name: 'More information about Whisky Islay',
                type: 'document'
              },
              {
                name: 'Details about Whisky Islay',
                type: 'document'
              },
            ]
          },
          {
            name: 'Speyside',
            type: 'category',
            children: []
          },
          {
            name: 'Campbeltown',
            type: 'category',
            children: []
          }
        ]
      }
    ]
  },
  {
    name: 'Uncategorised documents',
    type: 'category',
    children: [
      {
        name: 'Uncategorised document 2',
        type: 'document'
      },
      {
        name: 'Uncategorised document 1',
        type: 'document'
      }
    ]
  }
]);

export const treeDataWithUncategorisedDocuments: DocumentTreeNode[] = [
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
        name: 'Beers encyclopedia',
        type: DocumentTreeNodeType.DOCUMENT
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
                    type: DocumentTreeNodeType.DOCUMENT
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
                type: DocumentTreeNodeType.DOCUMENT
              },
              {
                name: 'More information about Whisky Islay',
                type: DocumentTreeNodeType.DOCUMENT
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
        type: DocumentTreeNodeType.DOCUMENT
      },
      {
        name: 'Uncategorised document 2',
        type: DocumentTreeNodeType.DOCUMENT
      }
    ]
  }
];
