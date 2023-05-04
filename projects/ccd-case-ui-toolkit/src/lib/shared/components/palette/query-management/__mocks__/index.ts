import { PartyMessages } from '../domain';

export const partyMessagesMockData: PartyMessages[] = [
  {
    partyName: 'John Smith - Appellant',
    partyMessages: [
      {
        id: 'case-message-001',
        subject: 'Review attached document',
        body: 'Please review attached document and advise if hearing should proceed?',
        attachments: [],
        isHearingRelated: true,
        hearingDate: new Date(2023, 0, 10),
        createdOn: new Date(2023, 0, 3),
        createdBy: '1111-1111-1111-1111'
      },
      {
        id: 'case-message-002',
        subject: 'Games',
        body: 'Can I play games in my phone when my solicitor is talking?',
        attachments: [],
        isHearingRelated: true,
        hearingDate: new Date(2023, 0, 10),
        createdOn: new Date(2023, 0, 3),
        createdBy: '1111-1111-1111-1111'
      },
      {
        id: 'case-message-003',
        subject: 'Games',
        body: 'Using mobile phone is strictly prohibited in the court room.',
        attachments: [],
        isHearingRelated: true,
        hearingDate: new Date(2023, 0, 10),
        createdOn: new Date(2023, 0, 4),
        createdBy: '2222-2222-2222-2222',
        parentId: 'case-message-002'
      },
      {
        id: 'case-message-004',
        subject: 'Games',
        body: 'In addition to my previous message, the mobile phones must be switched off inside the premises.',
        attachments: [],
        isHearingRelated: true,
        hearingDate: new Date(2023, 0, 10),
        createdOn: new Date(2023, 0, 4),
        createdBy: '2222-2222-2222-2222',
        parentId: 'case-message-002'
      }
    ]
  },
  {
    partyName: 'Kevin Peterson - Respondent',
    partyMessages: [
      {
        id: 'case-message-005',
        subject: 'Add respondent detention order',
        body: 'Please add respondent detention order to the file XX20230423-DX.',
        attachments: [],
        isHearingRelated: false,
        createdOn: new Date(2023, 1, 5),
        createdBy: '1111-1111-1111-1111'
      },
      {
        id: 'case-message-006',
        subject: 'Actioned: Respondent detention order added',
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
        body: 'Can I eat in the hearings?',
        attachments: [],
        isHearingRelated: true,
        hearingDate: new Date(2023, 0, 10),
        createdOn: new Date(2023, 0, 3),
        createdBy: '1111-1111-1111-1111'
      },
      {
        id: 'case-message-008',
        subject: 'Food',
        body: 'Consumption of food is not allowed when a hearing is taking place.',
        attachments: [],
        isHearingRelated: true,
        hearingDate: new Date(2023, 0, 10),
        createdOn: new Date(2023, 0, 5),
        createdBy: '2222-2222-2222-2222',
        parentId: 'case-message-007'
      },
      {
        id: 'case-message-009',
        subject: 'Bring relatives',
        body: 'Can I bring my grandma with me so she get out from the residence?',
        attachments: [],
        isHearingRelated: true,
        hearingDate: new Date(2023, 0, 10),
        createdOn: new Date(2023, 0, 6),
        createdBy: '1111-1111-1111-1111'
      },
      {
        id: 'case-message-010',
        subject: 'Bring relatives',
        body: 'Sorry, only those required for the hearing should be present inside the court room.',
        attachments: [],
        isHearingRelated: true,
        hearingDate: new Date(2023, 0, 10),
        createdOn: new Date(2023, 0, 7),
        createdBy: '2222-2222-2222-2222',
        parentId: 'case-message-009'
      },
      {
        id: 'case-message-011',
        subject: 'Bring relatives',
        body: 'You are allowed to bring only those mentioned in the hearing request. For example, sign language interpreter.',
        attachments: [],
        isHearingRelated: true,
        hearingDate: new Date(2023, 0, 10),
        createdOn: new Date(2023, 0, 7),
        createdBy: '2222-2222-2222-2222',
        parentId: 'case-message-009'
      }
    ]
  }
];
