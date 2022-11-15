import { DocumentTreeNode } from '../../../../domain/case-file-view/document-tree-node.model';

export const treeData: DocumentTreeNode[] = [
  {
    name: 'Beers',
    children: [
      {
        name: 'Bitters',
        children: []
      },
      {
        name: 'American',
        children: []
      },
      {
        name: 'Asian',
        children: []
      },
      {
        name: 'Beers encyclopedia'
      }
    ]
  },
  {
    name: 'Wines',
    children: [
      {
        name: 'French',
        children: []
      },
      {
        name: 'Italian',
        children: []
      }
    ]
  },
  {
    name: 'Spirits',
    children: [
      {
        name: 'Scotch whisky',
        children: [
          {
            name: 'Highland',
            children: [
              {
                name: 'Highland 1',
                children: []
              }
            ]
          },
          {
            name: 'Lowland',
            children: [
              {
                name: 'Lowland 1',
                children: [
                  {
                    name: 'Details about Whisky Lowland 1'
                  }
                ]
              },
              {
                name: 'Lowland 2',
                children: []
              }
            ]
          },
          {
            name: 'Islay',
            children: [
              {
                name: 'Details about Whisky Islay'
              },
              {
                name: 'More information about Whisky Islay'
              }
            ]
          },
          {
            name: 'Speyside',
            children: []
          },
          {
            name: 'Campbeltown',
            children: []
          }
        ]
      }
    ]
  }
];
