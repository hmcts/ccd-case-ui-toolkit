import { plainToClass } from 'class-transformer';
import { DocumentTreeNode } from '../../../../domain/case-file-view';

export const categorisedTreeData: DocumentTreeNode[] = plainToClass(DocumentTreeNode, [
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
        name: 'Ale encyclopedia',
        type: 'document'
      },
      {
        name: 'Beers encyclopedia',
        type: 'document'
      },
      {
        name: 'Lager encyclopedia',
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
        name: 'Uncategorised document 1',
        type: 'document'
      },
      {
        name: 'Uncategorised document 2',
        type: 'document'
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
