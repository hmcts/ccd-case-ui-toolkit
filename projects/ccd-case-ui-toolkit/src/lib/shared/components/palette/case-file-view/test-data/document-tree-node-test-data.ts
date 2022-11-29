import { plainToClass } from 'class-transformer';
import { DocumentTreeNode, DocumentTreeNodeType } from '../../../../domain/case-file-view';

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
        type: DocumentTreeNodeType.DOCUMENT
      },
      {
        name: 'Beers encyclopedia',
        type: DocumentTreeNodeType.DOCUMENT
      },
      {
        name: 'Ale encyclopedia',
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

export const uncategorisedTreeData: DocumentTreeNode = plainToClass(DocumentTreeNode, {
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
]);

export const treeDataSortedAlphabeticallyDesc: DocumentTreeNode[] = plainToClass(DocumentTreeNode, [
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
        type: DocumentTreeNodeType.DOCUMENT
      },
      {
        name: 'Beers encyclopedia',
        type: DocumentTreeNodeType.DOCUMENT
      },
      {
        name: 'Ale encyclopedia',
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
                name: 'More information about Whisky Islay',
                type: DocumentTreeNodeType.DOCUMENT
              },
              {
                name: 'Details about Whisky Islay',
                type: DocumentTreeNodeType.DOCUMENT
              },
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
        name: 'Uncategorised document 2',
        type: DocumentTreeNodeType.DOCUMENT
      },
      {
        name: 'Uncategorised document 1',
        type: DocumentTreeNodeType.DOCUMENT
      }
    ]
  }
]);
