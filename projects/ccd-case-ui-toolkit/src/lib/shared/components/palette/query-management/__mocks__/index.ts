import { PartyMessagesGroup } from '../models';

export const partyMessagesMockData: PartyMessagesGroup[] = [
  {
    partyName: 'John Smith - Appellant',
    roleOnCase: null,
    partyMessages: [
      {
        id: 'case-message-001',
        subject: 'Review attached document',
        name: 'Maggie Conroy',
        body: 'Please review attached document and advise if hearing should proceed?',
        attachments: [
          {
            _links: {
              self: { href: 'https://dm-store-aat.service.core-compute-aat.internal/documents/e5366837-b3f6-492d-acbf-548730625e8f' },
              binary: { href: 'https://dm-store-aat.service.core-compute-aat.internal/documents/e5366837-b3f6-492d-acbf-548730625e8f/binary' },
            },
            originalDocumentName: 'Screenshot 2023-06-01 at 16.07.06.png',
          },
          {
            _links: {
              self: { href: 'https://dm-store-aat.service.core-compute-aat.internal/documents/f50ccd7a-7f28-40f3-b5f9-7ad2f6425506' },
              binary: { href: 'https://dm-store-aat.service.core-compute-aat.internal/documents/f50ccd7a-7f28-40f3-b5f9-7ad2f6425506/binary' },
            },
            originalDocumentName: 'dummy.pdf',
          }
        ],
        isHearingRelated: true,
        hearingDate: '10 Jan 2023',
        createdOn: new Date(2023, 0, 3),
        createdBy: '1111-1111-1111-1111'
      },
      {
        id: 'case-message-002',
        subject: 'Games',
        name: 'Maggie Conroy',
        body: 'Can I play games in my phone when my solicitor is talking?',
        attachments: [
          {
            _links: {
              self: { href: '/' },
              binary: { href: '/' },
            },
            originalDocumentName: 'talking-document.pdf',
          }
        ],
        isHearingRelated: true,
        hearingDate: '10 Jan 2023',
        createdOn: new Date(2023, 0, 3),
        createdBy: '1111-1111-1111-1111'
      },
      {
        id: 'case-message-011',
        name: 'John Smith',
        body: 'Using mobile phone is strictly prohibited in the court room.',
        attachments: [
          {
            _links: {
              self: { href: '/' },
              binary: { href: '/' },
            },
            originalDocumentName: 'games-document.pdf',
          }
        ],
        isHearingRelated: true,
        hearingDate: '10 Jan 2023',
        createdOn: new Date(2023, 2, 4),
        createdBy: '2222-2222-2222-2222',
        parentId: 'case-message-002'
      },
      {
        id: 'case-message-012',
        name: 'Maggie Conroy',
        body: 'Can I use a tablet instead?',
        attachments: [
          {
            _links: {
              self: { href: '/' },
              binary: { href: '/' },
            },
            originalDocumentName: 'tablet-document.pdf',
          }
        ],
        isHearingRelated: true,
        hearingDate: '10 Jan 2023',
        createdOn: new Date(2023, 3, 8),
        createdBy: '2222-2222-2222-2222',
        parentId: 'case-message-002'
      },
      {
        id: 'case-message-013',
        name: 'John Smith',
        body: 'No, you cannot use a tablet either.',
        attachments: [],
        isHearingRelated: true,
        hearingDate: '10 Jan 2023',
        createdOn: new Date(2023, 4, 24),
        createdBy: '2222-2222-2222-2222',
        parentId: 'case-message-002'
      }
    ]
  },
  {
    partyName: 'Kevin Peterson - Respondent',
    roleOnCase: null,
    partyMessages: [
      {
        id: 'case-message-005',
        subject: 'Add respondent detention order',
        name: 'Maggie Conroy',
        body: 'Please add respondent detention order to the file XX20230423-DX.',
        attachments: [],
        isHearingRelated: false,
        createdOn: new Date(2023, 1, 5),
        createdBy: '1111-1111-1111-1111'
      },
      {
        id: 'case-message-006',
        name: 'Maggie Conroy',
        body: 'I confirm that the respondent detention order is now added to the file XX20230423-DX.',
        attachments: [],
        isHearingRelated: false,
        createdOn: new Date(2023, 1, 6),
        createdBy: '2222-2222-2222-2222',
        parentId: 'case-message-005'
      },
      {
        id: 'case-message-007',
        subject: 'Food',
        name: 'Maggie Conroy',
        body: 'Can I eat in the hearings?',
        attachments: [],
        isHearingRelated: true,
        hearingDate: '10 Jan 2023',
        createdOn: new Date(2023, 0, 3),
        createdBy: '1111-1111-1111-1111'
      },
      {
        id: 'case-message-008',
        name: 'Maggie Conroy',
        body: 'Consumption of food is not allowed when a hearing is taking place.',
        attachments: [],
        isHearingRelated: true,
        hearingDate: '10 Jan 2023',
        createdOn: new Date(2023, 0, 5),
        createdBy: '2222-2222-2222-2222',
        parentId: 'case-message-007'
      },
      {
        id: 'case-message-009',
        subject: 'Bring relatives',
        name: 'Maggie Conroy',
        body: 'Can I bring my grandma with me so she get out from the residence?',
        attachments: [],
        isHearingRelated: true,
        hearingDate: '10 Jan 2023',
        createdOn: new Date(2023, 0, 6),
        createdBy: '1111-1111-1111-1111'
      },
      {
        id: 'case-message-010',
        name: 'Maggie Conroy',
        body: 'Sorry, only those required for the hearing should be present inside the court room.',
        attachments: [],
        isHearingRelated: true,
        hearingDate: '10 Jan 2023',
        createdOn: new Date(2023, 0, 7),
        createdBy: '2222-2222-2222-2222',
        parentId: 'case-message-009'
      }
    ]
  }
];
