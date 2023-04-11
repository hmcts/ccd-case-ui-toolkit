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
        type: DocumentTreeNodeType.DOCUMENT,
        document_filename: 'Lager encyclopedia',
        document_binary_url: '/test/binary',
        attribute_path: '',
        upload_timestamp: '11 May 2023'
      },
      {
        name: 'Beers encyclopedia',
        type: DocumentTreeNodeType.DOCUMENT,
        document_filename: 'Beers encyclopedia',
        document_binary_url: '/test/binary',
        attribute_path: '',
        upload_timestamp: '14 Apr 2023'
      },
      {
        name: 'Ale encyclopedia',
        type: DocumentTreeNodeType.DOCUMENT,
        document_filename: 'Ale encyclopedia',
        document_binary_url: '/test/binary',
        attribute_path: '',
        upload_timestamp: '12 Mar 2023'
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
                    document_binary_url: '/test/binary',
                    attribute_path: '',
                    upload_timestamp: '21 Jun 2022'
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
                document_binary_url: '/test/binary',
                attribute_path: '',
                upload_timestamp: '04 Nov 2022'
              },
              {
                name: 'More information about Whisky Islay',
                type: DocumentTreeNodeType.DOCUMENT,
                document_filename: 'More information about Whisky Islay',
                document_binary_url: '/test/binary',
                attribute_path: '',
                upload_timestamp: '28 Dec 2022'
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
      type: DocumentTreeNodeType.DOCUMENT,
      document_filename: 'Uncategorised document 1',
      document_binary_url: '/test/binary',
      attribute_path: '',
      upload_timestamp: '17 Nov 2022'
    },
    {
      name: 'Uncategorised document 2',
      type: DocumentTreeNodeType.DOCUMENT,
      document_filename: 'Uncategorised document 2',
      document_binary_url: '/test/binary',
      attribute_path: '',
      upload_timestamp: '23 Feb 2023'
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
        type: DocumentTreeNodeType.DOCUMENT,
        document_filename: 'Ale encyclopedia',
        document_binary_url: '/test/binary',
        attribute_path: '',
        upload_timestamp: '12 Mar 2023'
      },
      {
        name: 'Beers encyclopedia',
        type: DocumentTreeNodeType.DOCUMENT,
        document_filename: 'Beers encyclopedia',
        document_binary_url: '/test/binary',
        attribute_path: '',
        upload_timestamp: '14 Apr 2023'
      },
      {
        name: 'Lager encyclopedia',
        type: DocumentTreeNodeType.DOCUMENT,
        document_filename: 'Lager encyclopedia',
        document_binary_url: '/test/binary',
        attribute_path: '',
        upload_timestamp: '11 May 2023'
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
                    document_binary_url: '/test/binary',
                    attribute_path: '',
                    upload_timestamp: '21 Jun 2022'
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
                document_binary_url: '/test/binary',
                attribute_path: '',
                upload_timestamp: '04 Nov 2022'
              },
              {
                name: 'More information about Whisky Islay',
                type: DocumentTreeNodeType.DOCUMENT,
                document_filename: 'More information about Whisky Islay',
                document_binary_url: '/test/binary',
                attribute_path: '',
                upload_timestamp: '28 Dec 2022'
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
        document_binary_url: '/test/binary',
        attribute_path: '',
        upload_timestamp: '17 Nov 2022'
      },
      {
        name: 'Uncategorised document 2',
        type: DocumentTreeNodeType.DOCUMENT,
        document_filename: 'Uncategorised document 2',
        document_binary_url: '/test/binary',
        attribute_path: '',
        upload_timestamp: '23 Feb 2023'
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
        type: DocumentTreeNodeType.DOCUMENT,
        document_filename: 'Lager encyclopedia',
        document_binary_url: '/test/binary',
        attribute_path: '',
        upload_timestamp: '11 May 2023' //new Date(2023, 4, 11)
      },
      {
        name: 'Beers encyclopedia',
        type: DocumentTreeNodeType.DOCUMENT,
        document_filename: 'Beers encyclopedia',
        document_binary_url: '/test/binary',
        attribute_path: '',
        upload_timestamp: '14 Apr 2023' // new Date(2023, 3, 14)
      },
      {
        name: 'Ale encyclopedia',
        type: DocumentTreeNodeType.DOCUMENT,
        document_filename: 'Ale encyclopedia',
        document_binary_url: '/test/binary',
        attribute_path: '',
        upload_timestamp: '12 Mar 2023' // new Date(2023, 2, 12)
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
                    document_binary_url: '/test/binary',
                    attribute_path: '',
                    upload_timestamp: '21 Jun 2022' // new Date(2022, 5, 21)
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
                type: DocumentTreeNodeType.DOCUMENT,
                document_filename: 'More information about Whisky Islay',
                document_binary_url: '/test/binary',
                attribute_path: '',
                upload_timestamp: '28 Dec 2022'
              },
              {
                name: 'Details about Whisky Islay',
                type: DocumentTreeNodeType.DOCUMENT,
                document_filename: 'Details about Whisky Islay',
                document_binary_url: '/test/binary',
                attribute_path: '',
                upload_timestamp: '04 Nov 2022'
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
        type: DocumentTreeNodeType.DOCUMENT,
        document_filename: 'Uncategorised document 2',
        document_binary_url: '/test/binary',
        attribute_path: '',
        upload_timestamp: '23 Feb 2023'
      },
      {
        name: 'Uncategorised document 1',
        type: DocumentTreeNodeType.DOCUMENT,
        document_filename: 'Uncategorised document 1',
        document_binary_url: '/test/binary',
        attribute_path: '',
        upload_timestamp: '17 Nov 2022'
      }
    ]
  }
]);
