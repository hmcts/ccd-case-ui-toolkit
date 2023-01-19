import {
  ChangeDetectorRef,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import {
  CaseEventData,
  CaseEventTrigger,
} from '../../../domain';
import {
  CaseFieldService,
  FormErrorService,
  FormValueService,
} from '../../../services';
import { CaseEditComponent } from '../case-edit/case-edit.component';
import { PageValidationService } from '../services';
import { CaseEditPageComponent } from './case-edit-page.component';

import { CaseEditDataService } from '../../../commons/case-edit-data/case-edit-data.service';

describe('CaseEditPageComponent', () => {
  let component: CaseEditPageComponent;

  const initializeComponent = ({
    caseEdit = {},
    formValueService = {},
    formErrorService = {},
    route = {},
    cdRef = {},
    pageValidationService = {},
    dialog = {},
    caseFieldService = {},
    caseEditDataService = {},
  }) =>
    new CaseEditPageComponent(
      caseEdit as CaseEditComponent,
      route as ActivatedRoute,
      formValueService as FormValueService,
      formErrorService as FormErrorService,
      cdRef as ChangeDetectorRef,
      pageValidationService as PageValidationService,
      dialog as MatDialog,
      caseFieldService as CaseFieldService,
      caseEditDataService as CaseEditDataService
    );

  it('should create', () => {
    component = initializeComponent({});

    expect(component).toBeTruthy();
  });

  describe('updateEventTriggerCaseFields', () => {
    it(`should NOT update event trigger's case fields as eventTrigger is null`, () => {
      component = initializeComponent({});
      const caseFieldIdMock = 'bothDefendants';
      const jsonDataMock = {} as unknown as CaseEventData;
      const eventTriggerMock = null;

      component.updateEventTriggerCaseFields(caseFieldIdMock, jsonDataMock, eventTriggerMock);

      expect(eventTriggerMock).toBeNull();
    });

    it(`should NOT update event trigger's case fields as eventTrigger has no case fields`, () => {
      component = initializeComponent({});
      const caseFieldIdMock = 'bothDefendants';
      const jsonDataMock = {} as unknown as CaseEventData;
      const eventTriggerMock = { id: 'noCaseFields' } as unknown as CaseEventTrigger;

      component.updateEventTriggerCaseFields(caseFieldIdMock, jsonDataMock, eventTriggerMock);

      expect(eventTriggerMock).toEqual(jasmine.objectContaining({ id: 'noCaseFields' }));
    });

    it(`should update event trigger's case fields value`, () => {
      component = initializeComponent({});
      const caseFieldIdMock = 'bothDefendants';
      const jsonDataMock = {
        data: {
          bothDefendants: true
        }
      } as unknown as CaseEventData;
      const eventTriggerMock = {
        ['case_fields']: [
          {
            id: 'bothDefendants',
            label: 'Both Defendants',
            value: null
          }
        ],
      } as unknown as CaseEventTrigger;
      component.updateEventTriggerCaseFields(caseFieldIdMock, jsonDataMock, eventTriggerMock);

      expect(eventTriggerMock['case_fields'][0].value).toEqual(true);
    });

    it(`should update event trigger's case fields value with jsonData's object`, () => {
      component = initializeComponent({});
      const caseFieldIdMock = 'bothDefendants';
      const result = {
        value: true
      };
      const jsonDataMock = {
        data: {
          bothDefendants: {
            value: true
          }
        }
      } as unknown as CaseEventData;
      const eventTriggerMock = {
        ['case_fields']: [
          {
            id: 'bothDefendants',
            label: 'Both Defendants',
            value: null
          }
        ],
      } as unknown as CaseEventTrigger;
      component.updateEventTriggerCaseFields(caseFieldIdMock, jsonDataMock, eventTriggerMock);

      expect(eventTriggerMock['case_fields'][0].value).toEqual(jasmine.objectContaining(result));
    });

    it(`should NOT update event trigger's case fields value as jsonData's value is null`, () => {
      component = initializeComponent({});
      const caseFieldIdMock = 'bothDefendants';
      const result = {
        people: {
          value: false
        }
      };
      const jsonDataMock = {
        data: {
          bothDefendants: {
            people: {
              list: ['sample', 'sample'],
              value: null
            }
          }

        }
      } as unknown as CaseEventData;
      const eventTriggerMock = {
        ['case_fields']: [
          {
            id: 'bothDefendants',
            label: 'Both Defendants',
            value: result
          }
        ],
      } as unknown as CaseEventTrigger;
      component.updateEventTriggerCaseFields(caseFieldIdMock, jsonDataMock, eventTriggerMock);

      expect(eventTriggerMock['case_fields'][0].value).toEqual(jasmine.objectContaining(result));
    });

    it(`should NOT update event trigger's case fields value as jsonData's value is undefined`, () => {
      component = initializeComponent({});
      const caseFieldIdMock = 'bothDefendants';
      const result = {
        people: {
          value: false
        }
      };
      const jsonDataMock = {
        data: {
          bothDefendants: {
            people: {
            list: ['sample', 'sample']
            }
          }
        }
      } as unknown as CaseEventData;
      const eventTriggerMock = {
        ['case_fields']: [
          {
            id: 'bothDefendants',
            label: 'Both Defendants',
            value: result
          }
        ],
      } as unknown as CaseEventTrigger;
      component.updateEventTriggerCaseFields(caseFieldIdMock, jsonDataMock, eventTriggerMock);

      expect(eventTriggerMock['case_fields'][0].value).toEqual(jasmine.objectContaining(result));
    });

    it(`should update event trigger's case fields value as jsonData's value is present`, () => {
      component = initializeComponent({});
      const caseFieldIdMock = 'bothDefendants';
      const result = {
          people: {
            value: true
          }
      };
      const jsonDataMock = {
        data: {
          bothDefendants: result
        }
      } as unknown as CaseEventData;
      const eventTriggerMock = {
        ['case_fields']: [
          {
            id: 'bothDefendants',
            label: 'Both Defendants',
            value: {
              people: {
                value: true
                }
            }
          }
        ],
      } as unknown as CaseEventTrigger;
      component.updateEventTriggerCaseFields(caseFieldIdMock, jsonDataMock, eventTriggerMock);

      expect(eventTriggerMock['case_fields'][0].value).toEqual(jasmine.objectContaining(result));
    });
  });
});
