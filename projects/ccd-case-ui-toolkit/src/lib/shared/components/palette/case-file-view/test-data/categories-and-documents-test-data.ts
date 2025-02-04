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
          upload_timestamp: '2024-12-31T09:56:00',
          content_type: ''
        },
        {
          document_url: '/test',
          document_filename: 'Beers encyclopedia',
          document_binary_url: '/test/binary',
          attribute_path: '',
          upload_timestamp: '2023-04-14T15:30:00.00',
          content_type: ''
        },
        {
          document_url: '/test',
          document_filename: 'Ale encyclopedia',
          document_binary_url: '/test/binary',
          attribute_path: '',
          upload_timestamp: '2023-03-12T01:23:01.00',
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
              upload_timestamp: '2023-02-10T00:00:00.00',
              content_type: ''
            },
            {
              document_url: '/prosecco',
              document_filename: 'Details about Prosecco',
              document_binary_url: '/test/binary',
              attribute_path: '',
              upload_timestamp: '2023-04-12T00:00:00.00',
              content_type: ''
            },
            {
              document_url: '/pinot-grigio',
              document_filename: 'Details about Pinot Grigio',
              document_binary_url: '/test/binary',
              attribute_path: '',
              upload_timestamp: '2023-03-16T00:00:00.00',
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
                      upload_timestamp: '2022-06-21T00:00:00.00',
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
                  upload_timestamp: '2022-11-04T00:00:00.00',
                  content_type: ''
                },
                {
                  document_url: '/test',
                  document_filename: 'More information about Whisky Islay',
                  document_binary_url: '/test/binary',
                  attribute_path: '',
                  upload_timestamp: '2022-12-28T00:00:00.00',
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
      upload_timestamp: '2022-11-17T00:00:00.00',
      content_type: ''
    },
    {
      document_url: '/uncategorised-document-2',
      document_filename: 'Uncategorised document 2',
      document_binary_url: '/test/binary',
      attribute_path: '',
      upload_timestamp: '2023-02-23T00:00:00.00',
      content_type: ''
    }
  ]
};
