import { plainToClass } from 'class-transformer';
import { DocumentTreeNode } from '../../../../domain/case-file-view';

export const treeData: DocumentTreeNode[] = plainToClass(DocumentTreeNode, [
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
        name: 'Beers encyclopedia',
        type: 'document'
      }
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
