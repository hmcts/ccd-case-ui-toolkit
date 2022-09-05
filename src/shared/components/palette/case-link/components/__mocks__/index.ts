import { CaseView } from '../../../../../domain';
import { LovRefDataByServiceModel } from '../../../../../services/common-data-service/common-data-service';
import { CaseLink } from '../../domain';

export const mockSearchByCaseIdsResponse = [
  {
    case_id: '1682374819203471',
    supplementary_data: {
      HMCTSServiceId: 'BBA3',
    },
    case_fields: {
      '[JURISDICTION]': 'SSCS',
      dwpDueDate: '2022-06-13',
      '[LAST_STATE_MODIFIED_DATE]': '2022-05-09T15:46:31.153',
      caseReference: '22',
      '[CREATED_DATE]': '2022-05-09T15:46:19.243',
      dateSentToDwp: '2022-05-09',
      '[CASE_REFERENCE]': '1652111179220086',
      '[STATE]': 'withDwp',
      '[ACCESS_GRANTED]': 'STANDARD',
      '[SECURITY_CLASSIFICATION]': 'PUBLIC',
      '[ACCESS_PROCESS]': 'NONE',
      '[CASE_TYPE]': 'Benefit_SCSS',
      'appeal.appellant.name.lastName': 'Torres',
      region: 'Quo nostrum vitae re',
      '[LAST_MODIFIED_DATE]': '2022-05-09T15:46:31.153',
    },
  },
]
export const mocklinkedCases: CaseLink[] = [
    {
      caseReference: '1682374819203471',
      reasons: [],
      createdDateTime: '',
      caseType: 'SSCS',
      caseState: 'state',
      caseService: 'Tribunal',
      caseName: 'SSCS 2.1',
    },
    {
      caseReference: '1682897456391875',
      reasons: [],
      createdDateTime: '',
      caseType: 'SSCS',
      caseState: 'state',
      caseService: 'Tribunal',
      caseName: 'SSCS 2.1',
    },
  ];

export const mockCaseLinkResponse = [
    {
      id: '52837798-42c6-43cc-98f6-0895fdba4961',
      value: {
        CaseType: 'FT_MasterCaseType',
        CaseReference: '1682374819203471',
        ReasonForLink: [
          {
            id: 'ffea83f4-3ec1-4be6-b530-e0b0b2a239aa',
            value: {
              Reason: 'CLRC001',
              OtherDescription: 'testing',
            },
          },
        ],
        CreatedDateTime: '2022-04-28T13:26:53.947877',
      },
    },
    {
      id: '52837798-42c6-43cc-98f6-0895fdba4962',
      value: {
        CaseType: 'BENEFIT_SCSS',
        CaseReference: '1682897456391875',
        ReasonForLink: [
          {
            id: 'ffea83f4-3ec1-4be6-b530-e0b0b2a239b',
            value: {
              Reason: 'CLRC002',
              OtherDescription: 'testing',
            },
          },
        ],
        CreatedDateTime: '2022-04-28T13:26:53.947877',
      },
    }
  ];

export const mockCaseLinkingReasonCode: LovRefDataByServiceModel = {
  list_of_values: [
    {
      category_key: 'CaseLinkingReasonCode',
      key: 'CLRC001',
      value_en: 'Related appeal',
      value_cy: '',
      hint_text_en: '',
      hint_text_cy: '',
      lov_order: null,
      parent_category: '',
      parent_key: '',
      active_flag: 'Y',
      child_nodes: null,
    },
    {
      category_key: 'CaseLinkingReasonCode',
      key: 'CLRC002',
      value_en: 'Related proceedings',
      value_cy: '',
      hint_text_en: '',
      hint_text_cy: '',
      lov_order: null,
      parent_category: '',
      parent_key: '',
      active_flag: 'Y',
      child_nodes: null,
    },
    {
      category_key: 'CaseLinkingReasonCode',
      key: 'CLRC006',
      value_en: 'Guardian',
      value_cy: '',
      hint_text_en: '',
      hint_text_cy: '',
      lov_order: null,
      parent_category: '',
      parent_key: '',
      active_flag: 'Y',
      child_nodes: null,
    },
  ],
};

export const CASE_VIEW_DATA: CaseView = {
  case_id: '11',
  case_type: {
    id: 'Benefit_Xui',
    name: 'Benefit_Xui',
    description: 'some case_type description',
    jurisdiction: {
      id: 'JURI_1',
      name: 'TEST',
      description: 'some jurisdiction description'
    }
  },
  state: null,
  channels: [],
  tabs: [],
  triggers: [],
  events: []
};
