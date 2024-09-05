import { plainToClass } from 'class-transformer';
import { DocumentTreeNode, DocumentTreeNodeType } from '../../../../domain/case-file-view';

export const lagerEncyclopedia = {
  name: 'Lager encyclopedia',
  type: DocumentTreeNodeType.DOCUMENT,
  document_filename: 'Lager encyclopedia',
  document_binary_url: '/test/binary',
  attribute_path: '',
  upload_timestamp: new Date(Date.UTC(2023, 4, 11, 11, 15, 0, 0)).toISOString(),
};

export const beersEncyclopedia = {
  name: 'Beers encyclopedia',
  type: DocumentTreeNodeType.DOCUMENT,
  document_filename: 'Beers encyclopedia',
  document_binary_url: '/test/binary',
  attribute_path: '',
  upload_timestamp: '2023-04-14T15:30:00.00'
};

export const aleEncyclopedia = {
  name: 'Ale encyclopedia',
  type: DocumentTreeNodeType.DOCUMENT,
  document_filename: 'Ale encyclopedia',
  document_binary_url: '/test/binary',
  attribute_path: '',
  upload_timestamp: '2023-03-12T01:23:01.00'
};

export const whiskyHighland = {
  name: 'Highland',
  type: DocumentTreeNodeType.FOLDER,
  children: [
    {
      name: 'Highland 1',
      type: DocumentTreeNodeType.FOLDER,
      children: [],
      category_order: 1
    }
  ],
  category_order: 1
};

export const whiskyLowland1 = {
  name: 'Details about Whisky Lowland 1',
  type: DocumentTreeNodeType.DOCUMENT,
  document_filename: 'Details about Whisky Lowland 1',
  document_binary_url: '/test/binary',
  attribute_path: '',
  upload_timestamp: '2022-06-21T00:00:00.00'
};

export const whiskyLowland = {
  name: 'Lowland',
  type: DocumentTreeNodeType.FOLDER,
  children: [
    {
      name: 'Lowland 1',
      type: DocumentTreeNodeType.FOLDER,
      children: [
        whiskyLowland1
      ],
      category_order: 1
    },
    {
      name: 'Lowland 2',
      type: DocumentTreeNodeType.FOLDER,
      children: [],
      category_order: 2
    }
  ],
  category_order: 2
};

export const whiskyIslayDetails = {
  name: 'Details about Whisky Islay',
  type: DocumentTreeNodeType.DOCUMENT,
  document_filename: 'Details about Whisky Islay',
  document_binary_url: '/test/binary',
  attribute_path: '',
  upload_timestamp: '2022-11-04T00:00:00.00'
};

export const whiskyIslayMoreInformation = {
  name: 'More information about Whisky Islay',
  type: DocumentTreeNodeType.DOCUMENT,
  document_filename: 'More information about Whisky Islay',
  document_binary_url: '/test/binary',
  attribute_path: '',
  upload_timestamp: '2022-12-28T00:00:00.00'
};

export const whiskySpeyside = {
  name: 'Speyside',
  type: DocumentTreeNodeType.FOLDER,
  children: [],
  category_order: 4
};

export const whiskyCampbelTown = {
  name: 'Campbeltown',
  type: DocumentTreeNodeType.FOLDER,
  children: [],
  category_order: 5
};

export const redWineItalian = {
  name: 'Details about red wine',
  type: DocumentTreeNodeType.DOCUMENT,
  document_filename: 'Details about red wine',
  document_binary_url: '/test/binary',
  attribute_path: '',
  upload_timestamp: ''
};

export const whiteWineItalian = {
  name: 'Details about white wine',
  type: DocumentTreeNodeType.DOCUMENT,
  document_filename: 'Details about white wine',
  document_binary_url: '/test/binary',
  attribute_path: '',
  upload_timestamp: '2023-02-10T00:00:00.00'
};

export const proseccoItalian = {
  name: 'Details about Prosecco',
  type: DocumentTreeNodeType.DOCUMENT,
  document_filename: 'Details about Prosecco',
  document_binary_url: '/test/binary',
  attribute_path: '',
  upload_timestamp: '2023-04-12T00:00:00.00'
};

export const pinotGrigioItalian = {
  name: 'Details about Pinot Grigio',
  type: DocumentTreeNodeType.DOCUMENT,
  document_filename: 'Details about Pinot Grigio',
  document_binary_url: '/test/binary',
  attribute_path: '',
  upload_timestamp: '2023-03-16T00:00:00.00'
};

export const beersAlphabeticallyAsc = {
  name: 'Beers',
  type: DocumentTreeNodeType.FOLDER,
  children: [
    {
      name: 'Bitters',
      type: DocumentTreeNodeType.FOLDER,
      children: [],
      category_order: 1
    },
    {
      name: 'American',
      type: DocumentTreeNodeType.FOLDER,
      children: [],
      category_order: 2
    },
    {
      name: 'Asian',
      type: DocumentTreeNodeType.FOLDER,
      children: [],
      category_order: 3
    },
    aleEncyclopedia,
    beersEncyclopedia,
    lagerEncyclopedia,
  ]
};

export const beersAlphabeticallyDesc = {
  name: 'Beers',
  type: DocumentTreeNodeType.FOLDER,
  children: [
    {
      name: 'Bitters',
      type: DocumentTreeNodeType.FOLDER,
      children: [],
      category_order: 1
    },
    {
      name: 'American',
      type: DocumentTreeNodeType.FOLDER,
      children: [],
      category_order: 2
    },
    {
      name: 'Asian',
      type: DocumentTreeNodeType.FOLDER,
      children: [],
      category_order: 3
    },
    lagerEncyclopedia,
    beersEncyclopedia,
    aleEncyclopedia,
  ]
};

export const winesAlphabeticallyAsc = {
  name: 'Wines',
  type: DocumentTreeNodeType.FOLDER,
  children: [
    {
      name: 'French',
      type: DocumentTreeNodeType.FOLDER,
      children: [],
      category_order: 1
    },
    {
      name: 'Italian',
      type: DocumentTreeNodeType.FOLDER,
      children: [
        pinotGrigioItalian,
        proseccoItalian,
        redWineItalian,
        whiteWineItalian
      ],
      category_order: 2
    }
  ]
};

export const winesAlphabeticallyDesc = {
  name: 'Wines',
  type: DocumentTreeNodeType.FOLDER,
  children: [
    {
      name: 'French',
      type: DocumentTreeNodeType.FOLDER,
      children: [],
      category_order: 1
    },
    {
      name: 'Italian',
      type: DocumentTreeNodeType.FOLDER,
      children: [
        whiteWineItalian,
        redWineItalian,
        proseccoItalian,
        pinotGrigioItalian
      ],
      category_order: 2
    }
  ]
};

export const spiritsAlphabeticallyAsc = {
  name: 'Spirits',
  type: DocumentTreeNodeType.FOLDER,
  children: [
    {
      name: 'Scotch whisky',
      type: DocumentTreeNodeType.FOLDER,
      children: [
        whiskyHighland,
        whiskyLowland,
        {
          name: 'Islay',
          type: DocumentTreeNodeType.FOLDER,
          children: [
            whiskyIslayDetails,
            whiskyIslayMoreInformation
          ],
          category_order: 3
        },
        whiskySpeyside,
        whiskyCampbelTown
      ],
      category_order: 1
    }
  ],
  // category_order:  3
};

export const spiritsAlphabeticallyDesc = {
  name: 'Spirits',
  type: DocumentTreeNodeType.FOLDER,
  children: [
    {
      name: 'Scotch whisky',
      type: DocumentTreeNodeType.FOLDER,
      children: [
        whiskyHighland,
        whiskyLowland,
        {
          name: 'Islay',
          type: DocumentTreeNodeType.FOLDER,
          children: [
            whiskyIslayMoreInformation,
            whiskyIslayDetails,
          ],
          category_order: 3
        },
        whiskySpeyside,
        whiskyCampbelTown
      ],
      category_order: 1
    }
  ]
};

export const uncategorisedDocument1 = {
  name: 'Uncategorised document 1',
  type: DocumentTreeNodeType.DOCUMENT,
  document_filename: 'Uncategorised document 1',
  document_binary_url: '/test/binary',
  attribute_path: '',
  upload_timestamp: '2022-11-17T00:00:00.00'
};

export const uncategorisedDocument2 = {
  name: 'Uncategorised document 2',
  type: DocumentTreeNodeType.DOCUMENT,
  document_filename: 'Uncategorised document 2',
  document_binary_url: '/test/binary',
  attribute_path: '',
  upload_timestamp: '2023-02-23T00:00:00.00'
};

export const categorisedTreeData: DocumentTreeNode[] = plainToClass(DocumentTreeNode, [
  {
    name: 'Beers',
    type: DocumentTreeNodeType.FOLDER,
    children: [
      {
        name: 'Bitters',
        type: DocumentTreeNodeType.FOLDER,
        children: [],
        category_order: 1
      },
      {
        name: 'American',
        type: DocumentTreeNodeType.FOLDER,
        children: [],
        category_order: 2
      },
      {
        name: 'Asian',
        type: DocumentTreeNodeType.FOLDER,
        children: [],
        category_order: 3
      },
      lagerEncyclopedia,
      beersEncyclopedia,
      aleEncyclopedia
    ],
    category_order: 1
  },
  {
    name: 'Wines',
    type: DocumentTreeNodeType.FOLDER,
    children: [
      {
        name: 'French',
        type: DocumentTreeNodeType.FOLDER,
        children: [],
        category_order: 1
      },
      {
        name: 'Italian',
        type: DocumentTreeNodeType.FOLDER,
        children: [
          redWineItalian,
          whiteWineItalian,
          proseccoItalian,
          pinotGrigioItalian
        ],
        category_order: 2
      }
    ],
    category_order: 2
  },
  {
    name: 'Spirits',
    type: DocumentTreeNodeType.FOLDER,
    children: [
      {
        name: 'Scotch whisky',
        type: DocumentTreeNodeType.FOLDER,
        children: [
          whiskyHighland,
          whiskyLowland,
          {
            name: 'Islay',
            type: DocumentTreeNodeType.FOLDER,
            children: [
              whiskyIslayDetails,
              whiskyIslayMoreInformation
            ],
            category_order: 3
          },
          whiskySpeyside,
          whiskyCampbelTown
        ],
        category_order: 1
      }
    ],
    category_order: 3
  }
]);

export const uncategorisedTreeData: DocumentTreeNode = plainToClass(DocumentTreeNode, {
  name: 'Uncategorised documents',
  type: DocumentTreeNodeType.FOLDER,
  children: [
    uncategorisedDocument1,
    uncategorisedDocument2
  ]
});

export const treeData = [
  ...categorisedTreeData,
  uncategorisedTreeData
];

export const treeDataSortedAlphabeticallyAsc: DocumentTreeNode[] = plainToClass(DocumentTreeNode, [
  beersAlphabeticallyAsc,
  winesAlphabeticallyAsc,
  spiritsAlphabeticallyAsc,
  {
    name: 'Uncategorised documents',
    type: DocumentTreeNodeType.FOLDER,
    children: [
      uncategorisedDocument1,
      uncategorisedDocument2
    ]
  }
]);

export const treeDataSortedAlphabeticallyDesc: DocumentTreeNode[] = plainToClass(DocumentTreeNode, [
  beersAlphabeticallyDesc,
  winesAlphabeticallyDesc,
  spiritsAlphabeticallyDesc,
  {
    name: 'Uncategorised documents',
    type: DocumentTreeNodeType.FOLDER,
    children: [
      uncategorisedDocument2,
      uncategorisedDocument1
    ]
  }
]);
