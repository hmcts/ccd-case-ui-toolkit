import { plainToClass } from 'class-transformer';
import { DocumentTreeNode, DocumentTreeNodeType } from '../../../../domain/case-file-view';

export const lagerEncyclopedia = {
  name: 'Lager encyclopedia',
  type: DocumentTreeNodeType.DOCUMENT,
  document_filename: 'Lager encyclopedia',
  document_binary_url: '/test/binary',
  attribute_path: '',
  upload_timestamp: '11 May 2023'
};

export const beersEncyclopedia = {
  name: 'Beers encyclopedia',
  type: DocumentTreeNodeType.DOCUMENT,
  document_filename: 'Beers encyclopedia',
  document_binary_url: '/test/binary',
  attribute_path: '',
  upload_timestamp: '14 Apr 2023'
};

export const aleEncyclopedia = {
  name: 'Ale encyclopedia',
  type: DocumentTreeNodeType.DOCUMENT,
  document_filename: 'Ale encyclopedia',
  document_binary_url: '/test/binary',
  attribute_path: '',
  upload_timestamp: '12 Mar 2023'
};

export const whiskyHighland = {
  name: 'Highland',
  type: DocumentTreeNodeType.FOLDER,
  children: [
    {
      name: 'Highland 1',
      type: DocumentTreeNodeType.FOLDER,
      children: []
    }
  ]
};

export const whiskyLowland1 = {
  name: 'Details about Whisky Lowland 1',
  type: DocumentTreeNodeType.DOCUMENT,
  document_filename: 'Details about Whisky Lowland 1',
  document_binary_url: '/test/binary',
  attribute_path: '',
  upload_timestamp: '21 Jun 2022'
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
      ]
    },
    {
      name: 'Lowland 2',
      type: DocumentTreeNodeType.FOLDER,
      children: []
    }
  ]
};

export const whiskyIslayDetails = {
  name: 'Details about Whisky Islay',
  type: DocumentTreeNodeType.DOCUMENT,
  document_filename: 'Details about Whisky Islay',
  document_binary_url: '/test/binary',
  attribute_path: '',
  upload_timestamp: '04 Nov 2022'
};

export const whiskyIslayMoreInformation = {
  name: 'More information about Whisky Islay',
  type: DocumentTreeNodeType.DOCUMENT,
  document_filename: 'More information about Whisky Islay',
  document_binary_url: '/test/binary',
  attribute_path: '',
  upload_timestamp: '28 Dec 2022'
};

export const whiskySpeyside = {
  name: 'Speyside',
  type: DocumentTreeNodeType.FOLDER,
  children: []
};

export const whiskyCampbelTown = {
  name: 'Campbeltown',
  type: DocumentTreeNodeType.FOLDER,
  children: []
};

export const wines = {
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
};

export const beersAlphabeticallyAsc = {
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
    lagerEncyclopedia,
    beersEncyclopedia,
    aleEncyclopedia,
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
          ]
        },
        whiskySpeyside,
        whiskyCampbelTown
      ]
    }
  ]
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
          ]
        },
        whiskySpeyside,
        whiskyCampbelTown
      ]
    }
  ]
};

export const uncategorisedDocument1 = {
  name: 'Uncategorised document 1',
  type: DocumentTreeNodeType.DOCUMENT,
  document_filename: 'Uncategorised document 1',
  document_binary_url: '/test/binary',
  attribute_path: '',
  upload_timestamp: '17 Nov 2022'
};

export const uncategorisedDocument2 = {
  name: 'Uncategorised document 2',
  type: DocumentTreeNodeType.DOCUMENT,
  document_filename: 'Uncategorised document 2',
  document_binary_url: '/test/binary',
  attribute_path: '',
  upload_timestamp: '23 Feb 2023'
};

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
      lagerEncyclopedia,
      beersEncyclopedia,
      aleEncyclopedia
    ]
  },
  wines,
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
            ]
          },
          whiskySpeyside,
          whiskyCampbelTown
        ]
      }
    ]
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
  wines,
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
  wines,
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
