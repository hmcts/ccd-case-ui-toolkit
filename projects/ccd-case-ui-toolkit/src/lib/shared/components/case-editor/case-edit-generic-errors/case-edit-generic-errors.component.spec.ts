import { CaseEditGenericErrorsComponent } from './case-edit-generic-errors.component';

describe('CaseEditGenericErrorsComponent', () => {
  it('should initialize', () => {
    const component = new CaseEditGenericErrorsComponent();
    component.error = {
      timestamp: '2017-05-24T15:24:17.857+0000',
      status: 422,
      error: 'Unprocessable Entity',
      exception: 'uk.gov.hmcts.ccd.endpoint.exceptions.ValidationException',
      message: 'string is not a known event ID for the specified case type TestAddressBookCase',
      path: '/caseworkers/0/jurisdictions/TEST/case-types/TestAddressBookCase/cases'
    };

    expect(component).toBeTruthy();
  });
});
