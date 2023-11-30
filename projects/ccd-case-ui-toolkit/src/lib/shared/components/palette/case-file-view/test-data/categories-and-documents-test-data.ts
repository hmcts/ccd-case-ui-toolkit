import { CategoriesAndDocuments } from '../../../../domain/case-file-view';

export const categoriesAndDocumentsTestData: CategoriesAndDocuments = {
  case_version: 1,
  categories: [
    {
      category_id: 'Beers',
      category_name: 'Beers',
      category_order: 1,
      documents: [
        {
          document_url: '/test',
          document_filename: 'Lager encyclopedia',
          document_binary_url: '/test/binary',
          attribute_path: '',
          upload_timestamp: new Date(2023, 4, 11),
          content_type: ''
        },
        {
          document_url: '/test',
          document_filename: 'Beers encyclopedia',
          document_binary_url: '/test/binary',
          attribute_path: '',
          upload_timestamp: new Date(2023, 3, 14),
          content_type: ''
        },
        {
          document_url: '/test',
          document_filename: 'Ale encyclopedia',
          document_binary_url: '/test/binary',
          attribute_path: '',
          upload_timestamp: new Date(2023, 2, 12),
          content_type: ''
        }
      ],
      sub_categories: [
        {
          category_id: 'BeersBitters',
          category_name: 'Bitters',
          category_order: 1,
          documents: [],
          sub_categories: []
        },
        {
          category_id: 'BeersAmerican',
          category_name: 'American',
          category_order: 2,
          documents: [],
          sub_categories: []
        },
        {
          category_id: 'BeersAsian',
          category_name: 'Asian',
          category_order: 3,
          documents: [],
          sub_categories: []
        }
      ]
    },
    {
      category_id: 'Wines',
      category_name: 'Wines',
      category_order: 2,
      documents: [],
      sub_categories: [
        {
          category_id: 'WinesFrench',
          category_name: 'French',
          category_order: 1,
          documents: [],
          sub_categories: []
        },
        {
          category_id: 'WinesItalian',
          category_name: 'Italian',
          category_order: 2,
          documents: [
            {
              document_url: '/red-wine',
              document_filename: 'Details about red wine',
              document_binary_url: '/test/binary',
              attribute_path: '',
              upload_timestamp: null,
              content_type: ''
            },
            {
              document_url: '/white-wine',
              document_filename: 'Details about white wine',
              document_binary_url: '/test/binary',
              attribute_path: '',
              upload_timestamp: new Date(2023, 1, 10),
              content_type: ''
            },
            {
              document_url: '/prosecco',
              document_filename: 'Details about Prosecco',
              document_binary_url: '/test/binary',
              attribute_path: '',
              upload_timestamp: new Date(2023, 3, 12),
              content_type: ''
            },
            {
              document_url: '/pinot-grigio',
              document_filename: 'Details about Pinot Grigio',
              document_binary_url: '/test/binary',
              attribute_path: '',
              upload_timestamp: new Date(2023, 2, 16),
              content_type: ''
            }
          ],
          sub_categories: []
        }
      ]
    },
    {
      category_id: 'Spirits',
      category_name: 'Spirits',
      category_order: 3,
      documents: [],
      sub_categories: [
        {
          category_id: 'SpiritsWhisky',
          category_name: 'Scotch whisky',
          category_order: 1,
          documents: [],
          sub_categories: [
            {
              category_id: 'WhiskyHighland',
              category_name: 'Highland',
              category_order: 1,
              documents: [],
              sub_categories: [
                {
                  category_id: 'WhiskyHighland1',
                  category_name: 'Highland 1',
                  category_order: 1,
                  documents: [],
                  sub_categories: []
                }
              ]
            },
            {
              category_id: 'WhiskyLowland',
              category_name: 'Lowland',
              category_order: 2,
              documents: [],
              sub_categories: [
                {
                  category_id: 'WhiskyLowland1',
                  category_name: 'Lowland 1',
                  category_order: 1,
                  documents: [
                    {
                      document_url: '/test',
                      document_filename: 'Details about Whisky Lowland 1',
                      document_binary_url: '/test/binary',
                      attribute_path: '',
                      upload_timestamp: new Date(2022, 5, 21),
                      content_type: ''
                    }
                  ],
                  sub_categories: []
                },
                {
                  category_id: 'WhiskyLowland2',
                  category_name: 'Lowland 2',
                  category_order: 2,
                  documents: [],
                  sub_categories: []
                }
              ]
            },
            {
              category_id: 'WhiskyIslay',
              category_name: 'Islay',
              category_order: 3,
              documents: [
                {
                  document_url: '/test',
                  document_filename: 'Details about Whisky Islay',
                  document_binary_url: '/test/binary',
                  attribute_path: '',
                  upload_timestamp: new Date(2022, 10, 4),
                  content_type: ''
                },
                {
                  document_url: '/test',
                  document_filename: 'More information about Whisky Islay',
                  document_binary_url: '/test/binary',
                  attribute_path: '',
                  upload_timestamp: new Date(2022, 11, 28),
                  content_type: ''
                }
              ],
              sub_categories: []
            },
            {
              category_id: 'WhiskySpeyside',
              category_name: 'Speyside',
              category_order: 4,
              documents: [],
              sub_categories: []
            },
            {
              category_id: 'WhiskyCampbeltown',
              category_name: 'Campbeltown',
              category_order: 5,
              documents: [],
              sub_categories: []
            }
          ]
        }
      ]
    }
  ],
  uncategorised_documents: [
    {
      document_url: '/uncategorised-document-1',
      document_filename: 'Uncategorised document 1',
      document_binary_url: '/test/binary',
      attribute_path: '',
      upload_timestamp: new Date(2022, 10, 17),
      content_type: ''
    },
    {
      document_url: '/uncategorised-document-2',
      document_filename: 'Uncategorised document 2',
      document_binary_url: '/test/binary',
      attribute_path: '',
      upload_timestamp: new Date(2023, 1, 23),
      content_type: ''
    }
  ]
};
