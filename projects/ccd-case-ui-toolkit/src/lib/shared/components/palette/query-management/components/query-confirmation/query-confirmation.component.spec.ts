import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QueryConfirmationComponent } from './query-confirmation.component';
import { QueryCreateContext } from '../../models';

describe('QueryConfirmationComponent', () => {
  let component: QueryConfirmationComponent;
  let fixture: ComponentFixture<QueryConfirmationComponent>;
  let nativeElement: any;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [QueryConfirmationComponent],
      providers: []
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QueryConfirmationComponent);
    component = fixture.componentInstance;
    nativeElement = fixture.debugElement.nativeElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display correct details for new query', () => {
    component.queryCreateContext = QueryCreateContext.NEW_QUERY;
    fixture.detectChanges();
    expect(nativeElement.querySelector('.govuk-panel__title').textContent).toEqual('Query submitted');
    expect(nativeElement.querySelector('.govuk-panel__body').textContent).toEqual('Your query has been sent to HMCTS');
    expect(nativeElement.querySelector('.govuk-link').textContent).toEqual('Go back to the case');
  });

  it('should display correct details for query response', () => {
    component.queryCreateContext = QueryCreateContext.RESPOND;
    fixture.detectChanges();
    expect(nativeElement.querySelector('.govuk-panel__title').textContent).toEqual('Query response submitted');
    expect(nativeElement.querySelector('.govuk-panel__body').textContent).toEqual('This query response has been added to the case');
    expect(nativeElement.querySelector('#tasks-link').textContent).toEqual('return to tasks');
    expect(nativeElement.querySelector('#case-link').textContent).toEqual('Go back to the case');
  });

  it('should display correct details for follow-up query', () => {
    component.queryCreateContext = QueryCreateContext.FOLLOWUP;
    fixture.detectChanges();
    expect(nativeElement.querySelector('.govuk-panel__title').textContent).toEqual('Query submitted');
    expect(nativeElement.querySelector('.govuk-panel__body').textContent).toEqual('Your query has been sent to HMCTS');
    expect(nativeElement.querySelector('.govuk-link').textContent).toEqual('Go back to the case');
  });
});
