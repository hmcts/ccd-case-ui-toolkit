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
        responseStatus: 'Response sent for Caseworker',
        body: 'Please review attached document and advise if hearing should proceed?',
        attachments: [
          {
            _links: {
              self: { href: '/' },
              binary: { href: '/' },
            },
            originalDocumentName: 'documentName.pdf',
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
        responseStatus: 'Response sent for Caseworker',
        body: 'Can I play games in my phone when my solicitor is talking?',
        attachments: [],
        isHearingRelated: true,
        hearingDate: '10 Jan 2023',
        createdOn: new Date(2023, 0, 3),
        createdBy: '1111-1111-1111-1111'
      },
      {
        id: 'case-message-003',
        name: 'Maggie Conroy',
        responseStatus: 'Response sent for Caseworker',
        body: 'Using mobile phone is strictly prohibited in the court room.',
        attachments: [],
        isHearingRelated: true,
        hearingDate: '10 Jan 2023',
        createdOn: new Date(2023, 0, 4),
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
        responseStatus: 'Response sent for Caseworker',
        body: 'Please add respondent detention order to the file XX20230423-DX.',
        attachments: [],
        isHearingRelated: false,
        createdOn: new Date(2023, 1, 5),
        createdBy: '1111-1111-1111-1111'
      },
      {
        id: 'case-message-006',
        name: 'Maggie Conroy',
        responseStatus: 'Response sent for Caseworker',
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
        responseStatus: 'Response sent for Caseworker',
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
        responseStatus: 'Response sent for Caseworker',
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
        responseStatus: 'Response received for professional user',
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
        responseStatus: 'Response received for professional user',
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
