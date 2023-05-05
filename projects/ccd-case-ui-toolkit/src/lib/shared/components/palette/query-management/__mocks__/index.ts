import { PartyMessages } from '../domain';

export const partyMessagesMockData: PartyMessages[] = [
  {
    partyName: 'John Smith - Appellant',
    roleOnCase: null,
    partyMessages: [
      {
        id: 'case-message-001',
        subject: 'Review attached document',
        name: 'Maggie Conroy',
        body: 'Please review attached document and advise if hearing should proceed?',
        attachments: [],
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
        attachments: [],
        isHearingRelated: true,
        hearingDate: '10 Jan 2023',
        createdOn: new Date(2023, 0, 3),
        createdBy: '1111-1111-1111-1111'
      },
      {
        id: 'case-message-003',
        name: 'Maggie Conroy',
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
