import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { QueryManagementService } from './query-management.service';
import { SessionStorageService } from '../../../../services';
import { QueryCreateContext } from '../models';
import {
  CASE_QUERIES_COLLECTION_ID,
  FIELD_TYPE_COMPLEX
} from '../constants/query-management.constants';
import { FormControl, FormGroup } from '@angular/forms';
import { QueryManagementUtils } from '../utils/query-management.utils';

describe('QueryManagementService', () => {
  let service: QueryManagementService;
  let routerSpy: jasmine.SpyObj<Router>;
  let sessionStorageServiceSpy: jasmine.SpyObj<SessionStorageService>;

  const mockUserDetails = JSON.stringify({
    name: 'John Smith',
    forename: 'John',
    surname: 'Smith'
  });

  const mockQueryItem = {
    id: 'abcd',
    name: 'John Smith',
    subject: 'Original',
    body: 'Initial message body',
    isHearingRelated: 'No',
    createdOn: new Date('2024-01-01T10:00:00Z'),
    createdBy: 'john.smith@example.com'
  } as any;

  beforeEach(() => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    sessionStorageServiceSpy = jasmine.createSpyObj('SessionStorageService', ['getItem']);

    TestBed.configureTestingModule({
      providers: [
        QueryManagementService,
        { provide: Router, useValue: routerSpy },
        { provide: SessionStorageService, useValue: sessionStorageServiceSpy }
      ]
    });

    service = TestBed.inject(QueryManagementService);
  });

  describe('#setCaseQueriesCollectionData', () => {
    it('should extract collections and assign fieldId with one matching field', () => {
      const eventData = {
        case_fields: [
          {
            id: 'queryField1',
            field_type: { id: CASE_QUERIES_COLLECTION_ID, type: FIELD_TYPE_COMPLEX },
            display_context: 'OPTIONAL',
            value: { caseMessages: [{ value: { id: '1234' } }] }
          }
        ],
        wizard_pages: [
          {
            wizard_page_fields: [{ case_field_id: 'queryField1', order: 1 }]
          }
        ]
      };

      const caseDetails = {
        case_type: {
          jurisdiction: { id: 'CIVIL' }
        }
      };

      service.setCaseQueriesCollectionData(eventData as any, QueryCreateContext.NEW_QUERY, caseDetails as any);

      expect(service.fieldId).toBe('queryField1');
      expect(Array.isArray(service.caseQueriesCollections)).toBe(true);
      expect(service.caseQueriesCollections.length).toBe(1);
      // the extracted collection should contain the caseMessages array
      expect(service.caseQueriesCollections[0].caseMessages?.length).toBe(1);
    });

    it('should handle multiple matching fields by picking the one with the lowest order', () => {
      const eventData = {
        case_fields: [
          {
            id: 'fieldA',
            field_type: { id: CASE_QUERIES_COLLECTION_ID, type: FIELD_TYPE_COMPLEX },
            display_context: 'OPTIONAL',
            value: {}
          },
          {
            id: 'fieldB',
            field_type: { id: CASE_QUERIES_COLLECTION_ID, type: FIELD_TYPE_COMPLEX },
            display_context: 'OPTIONAL',
            value: {}
          }
        ],
        wizard_pages: [
          {
            wizard_page_fields: [
              { case_field_id: 'fieldA', order: 2 },
              { case_field_id: 'fieldB', order: 1 }
            ]
          }
        ]
      };

      const caseDetails = {
        case_type: {
          jurisdiction: { id: 'CIVIL' }
        }
      };

      service.setCaseQueriesCollectionData(eventData as any, QueryCreateContext.NEW_QUERY, caseDetails as any);
      expect(service.fieldId).toBe('fieldB');
    });

    it('should log error and skip processing for unsupported jurisdiction with multiple collections', () => {
      spyOn(console, 'error');

      const eventData = {
        case_fields: [
          {
            id: 'fieldA',
            field_type: { id: CASE_QUERIES_COLLECTION_ID, type: FIELD_TYPE_COMPLEX },
            display_context: 'OPTIONAL',
            value: {}
          },
          {
            id: 'fieldB',
            field_type: { id: CASE_QUERIES_COLLECTION_ID, type: FIELD_TYPE_COMPLEX },
            display_context: 'OPTIONAL',
            value: {}
          }
        ]
      };

      const caseDetails = {
        case_type: {
          jurisdiction: { id: 'PUBLICLAW' }
        }
      };

      service.setCaseQueriesCollectionData(eventData as any, QueryCreateContext.NEW_QUERY, caseDetails as any);

      // resolveFieldId logs the jurisdiction-specific error, and setCaseQueriesCollectionData logs a second message.
      expect((console.error as jasmine.Spy).calls.argsFor(0)[0]).toBe(
        'Error: Multiple CaseQueriesCollections are not supported yet for the PUBLICLAW jurisdiction'
      );
      expect(service.fieldId).toBeUndefined();
    });
  });

  describe('#generateCaseQueriesCollectionData', () => {
    beforeEach(() => {
      sessionStorageServiceSpy.getItem.and.returnValue(mockUserDetails);
    });

    it('should redirect to service down if fieldId is not set', () => {
      const formGroup = new FormGroup({
        subject: new FormControl('Test'),
        body: new FormControl('Details'),
        attachments: new FormControl([]),
        isHearingRelated: new FormControl('Yes'),
        hearingDate: new FormControl('2024-08-01')
      });

      service.fieldId = null;

      expect(() => {
        service.generateCaseQueriesCollectionData(
          formGroup,
          QueryCreateContext.NEW_QUERY,
          null
        );
      }).toThrowError('Field ID for CaseQueriesCollection not found. Aborting query data generation.');

      expect(routerSpy.navigate).toHaveBeenCalledWith(['/', 'service-down']);
    });

    it('should create a new collection when no existing ones are present', () => {
      service.fieldId = 'queryField';
      service.caseQueriesCollections = [];

      const formGroup = new FormGroup({
        subject: new FormControl('Subject'),
        body: new FormControl('Body'),
        attachments: new FormControl([]),
        isHearingRelated: new FormControl('Yes'),
        hearingDate: new FormControl('2024-08-01')
      });

      const result = service.generateCaseQueriesCollectionData(
        formGroup,
        QueryCreateContext.NEW_QUERY,
        null
      );

      expect(result.queryField.partyName).toBe('John Smith');
      expect(result.queryField.caseMessages.length).toBe(1);
    });

    it('should append to matched collection if message ID matches', () => {
      service.fieldId = 'queryField';
      service.caseQueriesCollections = [
        {
          partyName: 'John Smith',
          roleOnCase: '',
          caseMessages: [
            {
              id: 'abcd',
              value: {
                id: 'abcd',
                name: 'John Smith',
                subject: 'Original',
                body: 'Initial message body',
                isHearingRelated: 'No',
                createdOn: new Date('2024-01-01T10:00:00Z'),
                createdBy: 'john.smith@example.com'
              }
            }
          ]
        }
      ];

      const formGroup = new FormGroup({
        subject: new FormControl('Follow-up'),
        body: new FormControl('Response'),
        attachments: new FormControl([]),
        isHearingRelated: new FormControl('Yes'),
        hearingDate: new FormControl('2024-08-01'),
        closeQuery: new FormControl(false)
      });

      const result = service.generateCaseQueriesCollectionData(
        formGroup,
        QueryCreateContext.RESPOND,
        mockQueryItem,
        'abcd'
      );

      expect(result.queryField.caseMessages.length).toBe(2);
      // ensure original message preserved and new message appended
      expect(result.queryField.caseMessages[0].value.id).toBe('abcd');
      expect(result.queryField.caseMessages[1].value).toBeDefined();
    });
  });

  describe('#getCaseQueriesCollectionFieldOrderFromWizardPages', () => {
    it('should return the correct field by order', () => {
      const eventData = {
        case_fields: [
          {
            id: 'lowOrder',
            field_type: { id: CASE_QUERIES_COLLECTION_ID, type: FIELD_TYPE_COMPLEX },
            display_context: 'OPTIONAL'
          },
          {
            id: 'highOrder',
            field_type: { id: CASE_QUERIES_COLLECTION_ID, type: FIELD_TYPE_COMPLEX },
            display_context: 'OPTIONAL'
          }
        ],
        wizard_pages: [
          {
            wizard_page_fields: [
              { case_field_id: 'lowOrder', order: 1 },
              { case_field_id: 'highOrder', order: 2 }
            ]
          }
        ]
      };

      const result = service['getCaseQueriesCollectionFieldOrderFromWizardPages'](eventData as any);
      expect(result.id).toBe('lowOrder');
    });
  });
});
