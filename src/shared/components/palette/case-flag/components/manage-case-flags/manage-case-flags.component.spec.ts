import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FlagDetail } from '../../domain/case-flag.model';
import { CaseFlagFieldState, SelectFlagLocationErrorMessage } from '../../enums';
import { ManageCaseFlagsComponent } from './manage-case-flags.component';

fdescribe('ManageCaseFlagsComponent', () => {
  let component: ManageCaseFlagsComponent;
  let fixture: ComponentFixture<ManageCaseFlagsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ ReactiveFormsModule ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
      declarations: [ ManageCaseFlagsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageCaseFlagsComponent);
    component = fixture.componentInstance;
    component.formGroup = new FormGroup({});
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should set an error condition if the case has not been configured for flags', () => {
    component.flagsData = [];
    spyOn(component.caseFlagStateEmitter, 'emit');
    component.ngOnInit();
    expect(component.filteredFlagsData).toEqual([]);
    expect(component.errorMessages[0]).toEqual({
      title: '',
      description: SelectFlagLocationErrorMessage.FLAGS_NOT_CONFIGURED,
      fieldId: 'conditional-radios-list'
    });
    expect(component.caseFlagsConfigError).toBe(true);
    expect(component.caseFlagStateEmitter.emit)
      .toHaveBeenCalledWith({ currentCaseFlagFieldState: CaseFlagFieldState.FLAG_TYPE, errorMessages: component.errorMessages });
    fixture.detectChanges();
    const nativeElement = fixture.debugElement.nativeElement;
    const nextButtonElement = nativeElement.querySelector('.button');
    // The "Next" button should not be present if the error condition has been set
    expect(nextButtonElement).toBeNull();
  });

  it('should return and expression with flag, association and the bracket comment', () => {
    const flagDisplay = { partyName: 'Ann Peterson', association: 'Language interpreter', comment: 'kiswahili (claimant does not speak English)', flagCode: '333' };
    const displayedExpression = component.processLabel(flagDisplay);
    expect(displayedExpression).toEqual(`${flagDisplay.partyName} - ${flagDisplay.association}, ${flagDisplay.comment}`);
  });

  it('should create display model', () => {
    const flagDetail = {
      name: 'Interpreter',
      dateTimeCreated: new Date(),
      path: ['path'],
      flagComment: 'comment',
      hearingRelevant: true,
      flagCode: '123',
      status: 'active'
    } as FlagDetail;

    const partyName = 'Wayne Sleep';
    const displayResult = component.flagDetailDisplay(flagDetail, partyName);
    expect(displayResult.partyName).toEqual(partyName);
    expect(displayResult.association).toEqual(flagDetail.name);
    expect(displayResult.comment).toEqual(flagDetail.flagComment);
    expect(displayResult.flagCode).toEqual(flagDetail.flagCode);
  });
});
