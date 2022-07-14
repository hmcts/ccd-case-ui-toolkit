export class CreateCaseFiltersSelection {
    public jurisdictionId: string;
    public caseTypeId: string;
    public eventId: string;

    constructor() {
        this.jurisdictionId = 'TEST',
        this.caseTypeId = 'TestAddressBookCase',
        this.eventId = 'startCase';
    }
}
