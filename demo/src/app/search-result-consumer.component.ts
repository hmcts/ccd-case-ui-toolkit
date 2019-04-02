import { Component, OnInit } from '@angular/core';
import { Jurisdiction, HttpError, CaseType, CaseState, SearchResultView, PaginationMetadata } from '@hmcts/ccd-case-ui-toolkit';

@Component({
    selector: 'search-result-consumer',
    templateUrl: 'search-result-consumer.component.html',
    styleUrls: ['./elements-documentation.scss']
})
export class SearchResultConsumerComponent implements OnInit {

    jurisdiction: Jurisdiction;
    caseType: CaseType;
    caseState: CaseState;
    resultView: SearchResultView;
    paginationMetadata: PaginationMetadata;
    metadataFields: string[];

    code = `
    <ccd-search-result
        *ngIf='resultView'
        [jurisdiction]='jurisdiction'
        [caseType]='caseType'
        [caseState]='caseState'
        [resultView]='resultView'
        [paginationMetadata]='paginationMetadata'
        [metadataFields]='metadataFields'
        (changePage)='apply($event)'
    ></ccd-search-result>`;

    constructor() {
    }

    ngOnInit(): void {
        setTimeout(() => {
            this.jurisdiction = {
                id: 'FR',
                name: 'Financial Remedy',
                description: 'Financial Remedy: remedy',
                caseTypes: [{
                    id: 'FR',
                    description: 'Handling of the financial remedy',
                    name: 'FR case - v108.10',
                    states: null,
                    events: [{
                        id: 'create',
                        name: 'Apply for a financial remedy',
                        description: 'Apply for a financial remedy',
                        pre_states: [],
                        post_state: null,
                        case_fields: []
                    }, {
                        id: 'create2',
                        name: 'Apply for a financial remedy 2',
                        description: 'Apply for a financial remedy 2',
                        pre_states: [],
                        post_state: null,
                        case_fields: []
                    }, {
                        id: 'create3',
                        name: 'Apply for a financial remedy 3',
                        description: 'Apply for a financial remedy 3',
                        pre_states: [],
                        post_state: null,
                        case_fields: []
                    }]
                }]
            };

            this.caseType = {
                id: 'caseType1Id',
                name: 'Case Type 1',
                description: 'Case Type 1 desc',
                case_fields: [],
                events: null,
                states: null,
                jurisdiction: null
            };

            this.caseState = {
                id: 'caseState1Id',
                name: 'Case State 1',
                description: 'Case State 1 desc'
            };

            this.resultView = {
                hasDrafts: () => false,
                columns: [{
                    'label': 'Text Field',
                    'order': 1,
                    'case_field_id': 'TextField',
                    'case_field_type': {
                        'id': 'Text',
                        'type': 'Text',
                        'min': null,
                        'max': null,
                        'regular_expression': null,
                        'fixed_list_items': [],
                        'complex_fields': [],
                        'collection_field_type': null
                    }
                }],
                results: [{
                    'case_id': '1554136917626756',
                    'case_fields': {
                        'AddressField': {},
                        '[JURISDICTION]': 'AUTOTEST1',
                        '[CREATED_DATE]': '2019-04-01T16:41:57.602',
                        'MoneyField': null,
                        'MarritalStatus': null,
                        '[CASE_REFERENCE]': 1554136917626756,
                        'NumberField': null,
                        '[STATE]': 'CaseCreated',
                        '[SECURITY_CLASSIFICATION]': 'PUBLIC',
                        'MultiSelectField': [],
                        '[CASE_TYPE]': 'AllDataTypes2',
                        'EmailField': null,
                        'YesNoField': null,
                        'TextField': 'Odin',
                        'PhoneField': null,
                        'DateField': null,
                        'TextAreaField': null,
                        '[LAST_MODIFIED_DATE]': '2019-04-01T16:41:57.602',
                        'CollectionField': []
                    }
                }, {
                    'case_id': '1554136919144741',
                    'case_fields': {
                        'AddressField': {},
                        '[JURISDICTION]': 'AUTOTEST1',
                        '[CREATED_DATE]': '2019-04-01T16:41:59.154',
                        'MoneyField': null,
                        'MarritalStatus': null,
                        '[CASE_REFERENCE]': 1554136919144741,
                        'NumberField': null,
                        '[STATE]': 'CaseCreated',
                        '[SECURITY_CLASSIFICATION]': 'PUBLIC',
                        'MultiSelectField': [],
                        '[CASE_TYPE]': 'AllDataTypes2',
                        'EmailField': null,
                        'YesNoField': null,
                        'TextField': 'Freya',
                        'PhoneField': null,
                        'DateField': null,
                        'TextAreaField': null,
                        '[LAST_MODIFIED_DATE]': '2019-04-01T16:41:59.154',
                        'CollectionField': []
                    }
                }, {
                    'case_id': '1554136920628047',
                    'case_fields': {
                        'AddressField': {},
                        '[JURISDICTION]': 'AUTOTEST1',
                        '[CREATED_DATE]': '2019-04-01T16:42:00.66',
                        'MoneyField': null,
                        'MarritalStatus': null,
                        '[CASE_REFERENCE]': 1554136920628047,
                        'NumberField': null,
                        '[STATE]': 'CaseCreated',
                        '[SECURITY_CLASSIFICATION]': 'PUBLIC',
                        'MultiSelectField': [],
                        '[CASE_TYPE]': 'AllDataTypes2',
                        'EmailField': null,
                        'YesNoField': null,
                        'TextField': 'Demeter',
                        'PhoneField': null,
                        'DateField': null,
                        'TextAreaField': null,
                        '[LAST_MODIFIED_DATE]': '2019-04-01T16:42:00.661',
                        'CollectionField': []
                    }
                }, {
                    'case_id': '1554136922163639',
                    'case_fields': {
                        'AddressField': {},
                        '[JURISDICTION]': 'AUTOTEST1',
                        '[CREATED_DATE]': '2019-04-01T16:42:02.163',
                        'MoneyField': null,
                        'MarritalStatus': null,
                        '[CASE_REFERENCE]': 1554136922163639,
                        'NumberField': null,
                        '[STATE]': 'CaseCreated',
                        '[SECURITY_CLASSIFICATION]': 'PUBLIC',
                        'MultiSelectField': [],
                        '[CASE_TYPE]': 'AllDataTypes2',
                        'EmailField': null,
                        'YesNoField': null,
                        'TextField': 'Quetzcuatl',
                        'PhoneField': null,
                        'DateField': null,
                        'TextAreaField': null,
                        '[LAST_MODIFIED_DATE]': '2019-04-01T16:42:02.164',
                        'CollectionField': []
                    }
                }, {
                    'case_id': '1554136923739585',
                    'case_fields': {
                        'AddressField': {},
                        '[JURISDICTION]': 'AUTOTEST1',
                        '[CREATED_DATE]': '2019-04-01T16:42:03.784',
                        'MoneyField': null,
                        'MarritalStatus': null,
                        '[CASE_REFERENCE]': 1554136923739585,
                        'NumberField': null,
                        '[STATE]': 'CaseCreated',
                        '[SECURITY_CLASSIFICATION]': 'PUBLIC',
                        'MultiSelectField': [],
                        '[CASE_TYPE]': 'AllDataTypes2',
                        'EmailField': null,
                        'YesNoField': null,
                        'TextField': 'Thor',
                        'PhoneField': null,
                        'DateField': null,
                        'TextAreaField': null,
                        '[LAST_MODIFIED_DATE]': '2019-04-01T16:42:03.785',
                        'CollectionField': []
                    }
                }, {
                    'case_id': '1554136925327678',
                    'case_fields': {
                        'AddressField': {},
                        '[JURISDICTION]': 'AUTOTEST1',
                        '[CREATED_DATE]': '2019-04-01T16:42:05.309',
                        'MoneyField': null,
                        'MarritalStatus': null,
                        '[CASE_REFERENCE]': 1554136925327678,
                        'NumberField': null,
                        '[STATE]': 'CaseCreated',
                        '[SECURITY_CLASSIFICATION]': 'PUBLIC',
                        'MultiSelectField': [],
                        '[CASE_TYPE]': 'AllDataTypes2',
                        'EmailField': null,
                        'YesNoField': null,
                        'TextField': 'Zeus',
                        'PhoneField': null,
                        'DateField': null,
                        'TextAreaField': null,
                        '[LAST_MODIFIED_DATE]': '2019-04-01T16:42:05.309',
                        'CollectionField': []
                    }
                }, {
                    'case_id': '1554136926729971',
                    'case_fields': {
                        'AddressField': {},
                        '[JURISDICTION]': 'AUTOTEST1',
                        '[CREATED_DATE]': '2019-04-01T16:42:06.758',
                        'MoneyField': null,
                        'MarritalStatus': null,
                        '[CASE_REFERENCE]': 1554136926729971,
                        'NumberField': null,
                        '[STATE]': 'CaseCreated',
                        '[SECURITY_CLASSIFICATION]': 'PUBLIC',
                        'MultiSelectField': [],
                        '[CASE_TYPE]': 'AllDataTypes2',
                        'EmailField': null,
                        'YesNoField': null,
                        'TextField': 'Wotan',
                        'PhoneField': null,
                        'DateField': null,
                        'TextAreaField': null,
                        '[LAST_MODIFIED_DATE]': '2019-04-01T16:42:06.758',
                        'CollectionField': []
                    }
                }, {
                    'case_id': '1554136928281575',
                    'case_fields': {
                        'AddressField': {},
                        '[JURISDICTION]': 'AUTOTEST1',
                        '[CREATED_DATE]': '2019-04-01T16:42:08.252',
                        'MoneyField': null,
                        'MarritalStatus': null,
                        '[CASE_REFERENCE]': 1554136928281575,
                        'NumberField': null,
                        '[STATE]': 'CaseCreated',
                        '[SECURITY_CLASSIFICATION]': 'PUBLIC',
                        'MultiSelectField': [],
                        '[CASE_TYPE]': 'AllDataTypes2',
                        'EmailField': null,
                        'YesNoField': null,
                        'TextField': 'Ares',
                        'PhoneField': null,
                        'DateField': null,
                        'TextAreaField': null,
                        '[LAST_MODIFIED_DATE]': '2019-04-01T16:42:08.252',
                        'CollectionField': []
                    }
                }, {
                    'case_id': '1554136929844231',
                    'case_fields': {
                        'AddressField': {},
                        '[JURISDICTION]': 'AUTOTEST1',
                        '[CREATED_DATE]': '2019-04-01T16:42:09.883',
                        'MoneyField': null,
                        'MarritalStatus': null,
                        '[CASE_REFERENCE]': 1554136929844231,
                        'NumberField': null,
                        '[STATE]': 'CaseCreated',
                        '[SECURITY_CLASSIFICATION]': 'PUBLIC',
                        'MultiSelectField': [],
                        '[CASE_TYPE]': 'AllDataTypes2',
                        'EmailField': null,
                        'YesNoField': null,
                        'TextField': 'Zephyr',
                        'PhoneField': null,
                        'DateField': null,
                        'TextAreaField': null,
                        '[LAST_MODIFIED_DATE]': '2019-04-01T16:42:09.883',
                        'CollectionField': []
                    }
                }, {
                    'case_id': '1554136931392591',
                    'case_fields': {
                        'AddressField': {},
                        '[JURISDICTION]': 'AUTOTEST1',
                        '[CREATED_DATE]': '2019-04-01T16:42:11.336',
                        'MoneyField': null,
                        'MarritalStatus': null,
                        '[CASE_REFERENCE]': 1554136931392591,
                        'NumberField': null,
                        '[STATE]': 'CaseCreated',
                        '[SECURITY_CLASSIFICATION]': 'PUBLIC',
                        'MultiSelectField': [],
                        '[CASE_TYPE]': 'AllDataTypes2',
                        'EmailField': null,
                        'YesNoField': null,
                        'TextField': 'Baldur',
                        'PhoneField': null,
                        'DateField': null,
                        'TextAreaField': null,
                        '[LAST_MODIFIED_DATE]': '2019-04-01T16:42:11.337',
                        'CollectionField': []
                    }
                }, {
                    'case_id': '1554136932800162',
                    'case_fields': {
                        'AddressField': {},
                        '[JURISDICTION]': 'AUTOTEST1',
                        '[CREATED_DATE]': '2019-04-01T16:42:12.88',
                        'MoneyField': null,
                        'MarritalStatus': null,
                        '[CASE_REFERENCE]': 1554136932800162,
                        'NumberField': null,
                        '[STATE]': 'CaseCreated',
                        '[SECURITY_CLASSIFICATION]': 'PUBLIC',
                        'MultiSelectField': [],
                        '[CASE_TYPE]': 'AllDataTypes2',
                        'EmailField': null,
                        'YesNoField': null,
                        'TextField': 'Aegir',
                        'PhoneField': null,
                        'DateField': null,
                        'TextAreaField': null,
                        '[LAST_MODIFIED_DATE]': '2019-04-01T16:42:12.881',
                        'CollectionField': []
                    }
                }, {
                    'case_id': '1554136934511601',
                    'case_fields': {
                        'AddressField': {},
                        '[JURISDICTION]': 'AUTOTEST1',
                        '[CREATED_DATE]': '2019-04-01T16:42:14.597',
                        'MoneyField': null,
                        'MarritalStatus': null,
                        '[CASE_REFERENCE]': 1554136934511601,
                        'NumberField': null,
                        '[STATE]': 'CaseCreated',
                        '[SECURITY_CLASSIFICATION]': 'PUBLIC',
                        'MultiSelectField': [],
                        '[CASE_TYPE]': 'AllDataTypes2',
                        'EmailField': null,
                        'YesNoField': null,
                        'TextField': 'Heimdall',
                        'PhoneField': null,
                        'DateField': null,
                        'TextAreaField': null,
                        '[LAST_MODIFIED_DATE]': '2019-04-01T16:42:14.597',
                        'CollectionField': []
                    }
                }, {
                    'case_id': '1554136936459437',
                    'case_fields': {
                        'AddressField': {},
                        '[JURISDICTION]': 'AUTOTEST1',
                        '[CREATED_DATE]': '2019-04-01T16:42:16.454',
                        'MoneyField': null,
                        'MarritalStatus': null,
                        '[CASE_REFERENCE]': 1554136936459437,
                        'NumberField': null,
                        '[STATE]': 'CaseCreated',
                        '[SECURITY_CLASSIFICATION]': 'PUBLIC',
                        'MultiSelectField': [],
                        '[CASE_TYPE]': 'AllDataTypes2',
                        'EmailField': null,
                        'YesNoField': null,
                        'TextField': 'Loki',
                        'PhoneField': null,
                        'DateField': null,
                        'TextAreaField': null,
                        '[LAST_MODIFIED_DATE]': '2019-04-01T16:42:16.455',
                        'CollectionField': []
                    }
                }, {
                    'case_id': '1554136937880334',
                    'case_fields': {
                        'AddressField': {},
                        '[JURISDICTION]': 'AUTOTEST1',
                        '[CREATED_DATE]': '2019-04-01T16:42:17.872',
                        'MoneyField': null,
                        'MarritalStatus': null,
                        '[CASE_REFERENCE]': 1554136937880334,
                        'NumberField': null,
                        '[STATE]': 'CaseCreated',
                        '[SECURITY_CLASSIFICATION]': 'PUBLIC',
                        'MultiSelectField': [],
                        '[CASE_TYPE]': 'AllDataTypes2',
                        'EmailField': null,
                        'YesNoField': null,
                        'TextField': 'Tyr',
                        'PhoneField': null,
                        'DateField': null,
                        'TextAreaField': null,
                        '[LAST_MODIFIED_DATE]': '2019-04-01T16:42:17.872',
                        'CollectionField': []
                    }
                }, {
                    'case_id': '1554136939385431',
                    'case_fields': {
                        'AddressField': {},
                        '[JURISDICTION]': 'AUTOTEST1',
                        '[CREATED_DATE]': '2019-04-01T16:42:19.339',
                        'MoneyField': null,
                        'MarritalStatus': null,
                        '[CASE_REFERENCE]': 1554136939385431,
                        'NumberField': null,
                        '[STATE]': 'CaseCreated',
                        '[SECURITY_CLASSIFICATION]': 'PUBLIC',
                        'MultiSelectField': [],
                        '[CASE_TYPE]': 'AllDataTypes2',
                        'EmailField': null,
                        'YesNoField': null,
                        'TextField': 'Hera',
                        'PhoneField': null,
                        'DateField': null,
                        'TextAreaField': null,
                        '[LAST_MODIFIED_DATE]': '2019-04-01T16:42:19.339',
                        'CollectionField': []
                    }
                }, {
                    'case_id': '1554136940977028',
                    'case_fields': {
                        'AddressField': {},
                        '[JURISDICTION]': 'AUTOTEST1',
                        '[CREATED_DATE]': '2019-04-01T16:42:20.932',
                        'MoneyField': null,
                        'MarritalStatus': null,
                        '[CASE_REFERENCE]': 1554136940977028,
                        'NumberField': null,
                        '[STATE]': 'CaseCreated',
                        '[SECURITY_CLASSIFICATION]': 'PUBLIC',
                        'MultiSelectField': [],
                        '[CASE_TYPE]': 'AllDataTypes2',
                        'EmailField': null,
                        'YesNoField': null,
                        'TextField': 'Dionysus',
                        'PhoneField': null,
                        'DateField': null,
                        'TextAreaField': null,
                        '[LAST_MODIFIED_DATE]': '2019-04-01T16:42:20.932',
                        'CollectionField': []
                    }
                }, {
                    'case_id': '1554136942525544',
                    'case_fields': {
                        'AddressField': {},
                        '[JURISDICTION]': 'AUTOTEST1',
                        '[CREATED_DATE]': '2019-04-01T16:42:22.554',
                        'MoneyField': null,
                        'MarritalStatus': null,
                        '[CASE_REFERENCE]': 1554136942525544,
                        'NumberField': null,
                        '[STATE]': 'CaseCreated',
                        '[SECURITY_CLASSIFICATION]': 'PUBLIC',
                        'MultiSelectField': [],
                        '[CASE_TYPE]': 'AllDataTypes2',
                        'EmailField': null,
                        'YesNoField': null,
                        'TextField': 'Poseidon',
                        'PhoneField': null,
                        'DateField': null,
                        'TextAreaField': null,
                        '[LAST_MODIFIED_DATE]': '2019-04-01T16:42:22.554',
                        'CollectionField': []
                    }
                }, {
                    'case_id': '1554136944179043',
                    'case_fields': {
                        'AddressField': {},
                        '[JURISDICTION]': 'AUTOTEST1',
                        '[CREATED_DATE]': '2019-04-01T16:42:24.119',
                        'MoneyField': null,
                        'MarritalStatus': null,
                        '[CASE_REFERENCE]': 1554136944179043,
                        'NumberField': null,
                        '[STATE]': 'CaseCreated',
                        '[SECURITY_CLASSIFICATION]': 'PUBLIC',
                        'MultiSelectField': [],
                        '[CASE_TYPE]': 'AllDataTypes2',
                        'EmailField': null,
                        'YesNoField': null,
                        'TextField': 'Mithras',
                        'PhoneField': null,
                        'DateField': null,
                        'TextAreaField': null,
                        '[LAST_MODIFIED_DATE]': '2019-04-01T16:42:24.119',
                        'CollectionField': []
                    }
                }, {
                    'case_id': '1554136945647667',
                    'case_fields': {
                        'AddressField': {},
                        '[JURISDICTION]': 'AUTOTEST1',
                        '[CREATED_DATE]': '2019-04-01T16:42:25.695',
                        'MoneyField': null,
                        'MarritalStatus': null,
                        '[CASE_REFERENCE]': 1554136945647667,
                        'NumberField': null,
                        '[STATE]': 'CaseCreated',
                        '[SECURITY_CLASSIFICATION]': 'PUBLIC',
                        'MultiSelectField': [],
                        '[CASE_TYPE]': 'AllDataTypes2',
                        'EmailField': null,
                        'YesNoField': null,
                        'TextField': 'Khantengri',
                        'PhoneField': null,
                        'DateField': null,
                        'TextAreaField': null,
                        '[LAST_MODIFIED_DATE]': '2019-04-01T16:42:25.695',
                        'CollectionField': []
                    }
                }, {
                    'case_id': '1554136947202792',
                    'case_fields': {
                        'AddressField': {},
                        '[JURISDICTION]': 'AUTOTEST1',
                        '[CREATED_DATE]': '2019-04-01T16:42:27.222',
                        'MoneyField': null,
                        'MarritalStatus': null,
                        '[CASE_REFERENCE]': 1554136947202792,
                        'NumberField': null,
                        '[STATE]': 'CaseCreated',
                        '[SECURITY_CLASSIFICATION]': 'PUBLIC',
                        'MultiSelectField': [],
                        '[CASE_TYPE]': 'AllDataTypes2',
                        'EmailField': null,
                        'YesNoField': null,
                        'TextField': 'Ishtar',
                        'PhoneField': null,
                        'DateField': null,
                        'TextAreaField': null,
                        '[LAST_MODIFIED_DATE]': '2019-04-01T16:42:27.222',
                        'CollectionField': []
                    }
                }, {
                    'case_id': '1554136949165542',
                    'case_fields': {
                        'AddressField': {},
                        '[JURISDICTION]': 'AUTOTEST1',
                        '[CREATED_DATE]': '2019-04-01T16:42:29.181',
                        'MoneyField': null,
                        'MarritalStatus': null,
                        '[CASE_REFERENCE]': 1554136949165542,
                        'NumberField': null,
                        '[STATE]': 'CaseCreated',
                        '[SECURITY_CLASSIFICATION]': 'PUBLIC',
                        'MultiSelectField': [],
                        '[CASE_TYPE]': 'AllDataTypes2',
                        'EmailField': null,
                        'YesNoField': null,
                        'TextField': 'Ahuramazda',
                        'PhoneField': null,
                        'DateField': null,
                        'TextAreaField': null,
                        '[LAST_MODIFIED_DATE]': '2019-04-01T16:42:29.181',
                        'CollectionField': []
                    }
                }, {
                    'case_id': '1554136950646083',
                    'case_fields': {
                        'AddressField': {},
                        '[JURISDICTION]': 'AUTOTEST1',
                        '[CREATED_DATE]': '2019-04-01T16:42:30.667',
                        'MoneyField': null,
                        'MarritalStatus': null,
                        '[CASE_REFERENCE]': 1554136950646083,
                        'NumberField': null,
                        '[STATE]': 'CaseCreated',
                        '[SECURITY_CLASSIFICATION]': 'PUBLIC',
                        'MultiSelectField': [],
                        '[CASE_TYPE]': 'AllDataTypes2',
                        'EmailField': null,
                        'YesNoField': null,
                        'TextField': 'Aphrodite',
                        'PhoneField': null,
                        'DateField': null,
                        'TextAreaField': null,
                        '[LAST_MODIFIED_DATE]': '2019-04-01T16:42:30.668',
                        'CollectionField': []
                    }
                }, {
                    'case_id': '1554136952068013',
                    'case_fields': {
                        'AddressField': {},
                        '[JURISDICTION]': 'AUTOTEST1',
                        '[CREATED_DATE]': '2019-04-01T16:42:32.077',
                        'MoneyField': null,
                        'MarritalStatus': null,
                        '[CASE_REFERENCE]': 1554136952068013,
                        'NumberField': null,
                        '[STATE]': 'CaseCreated',
                        '[SECURITY_CLASSIFICATION]': 'PUBLIC',
                        'MultiSelectField': [],
                        '[CASE_TYPE]': 'AllDataTypes2',
                        'EmailField': null,
                        'YesNoField': null,
                        'TextField': 'Crom',
                        'PhoneField': null,
                        'DateField': null,
                        'TextAreaField': null,
                        '[LAST_MODIFIED_DATE]': '2019-04-01T16:42:32.078',
                        'CollectionField': []
                    }
                }, {
                    'case_id': '1554136953622263',
                    'case_fields': {
                        'AddressField': {},
                        '[JURISDICTION]': 'AUTOTEST1',
                        '[CREATED_DATE]': '2019-04-01T16:42:33.657',
                        'MoneyField': null,
                        'MarritalStatus': null,
                        '[CASE_REFERENCE]': 1554136953622263,
                        'NumberField': null,
                        '[STATE]': 'CaseCreated',
                        '[SECURITY_CLASSIFICATION]': 'PUBLIC',
                        'MultiSelectField': [],
                        '[CASE_TYPE]': 'AllDataTypes2',
                        'EmailField': null,
                        'YesNoField': null,
                        'TextField': 'Lady of the Lake',
                        'PhoneField': null,
                        'DateField': null,
                        'TextAreaField': null,
                        '[LAST_MODIFIED_DATE]': '2019-04-01T16:42:33.657',
                        'CollectionField': []
                    }
                }, {
                    'case_id': '1554136955386362',
                    'case_fields': {
                        'AddressField': {},
                        '[JURISDICTION]': 'AUTOTEST1',
                        '[CREATED_DATE]': '2019-04-01T16:42:35.365',
                        'MoneyField': null,
                        'MarritalStatus': null,
                        '[CASE_REFERENCE]': 1554136955386362,
                        'NumberField': null,
                        '[STATE]': 'CaseCreated',
                        '[SECURITY_CLASSIFICATION]': 'PUBLIC',
                        'MultiSelectField': [],
                        '[CASE_TYPE]': 'AllDataTypes2',
                        'EmailField': null,
                        'YesNoField': null,
                        'TextField': 'Morgana',
                        'PhoneField': null,
                        'DateField': null,
                        'TextAreaField': null,
                        '[LAST_MODIFIED_DATE]': '2019-04-01T16:42:35.365',
                        'CollectionField': []
                    }
                }],
                result_error: null
            }
        }, 2000);
    }

    apply(selected) {
        console.log(selected);

    }

}
