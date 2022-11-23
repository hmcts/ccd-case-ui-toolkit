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
        name: 'Lager encyclopedia',
        type: 'document',
        document_filename: 'Lager encyclopedia',
        document_binary_url: '/test/binary'
      },
      {
        name: 'Beers encyclopedia',
        type: 'document',
        document_filename: 'Beers encyclopedia',
        document_binary_url: '/test/binary'
      },
      {
        name: 'Ale encyclopedia',
        type: 'document',
        document_filename: 'Ale encyclopedia',
        document_binary_url: '/test/binary'
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
                    type: 'document',
                    document_filename: 'Details about Whisky Lowland 1',
                    document_binary_url: '/test/binary'
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
                type: 'document',
                document_filename: 'Details about Whisky Islay',
                document_binary_url: '/test/binary'
              },
              {
                name: 'More information about Whisky Islay',
                type: 'document',
                document_filename: 'More information about Whisky Islay',
                document_binary_url: '/test/binary'
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
