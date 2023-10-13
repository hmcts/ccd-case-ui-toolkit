import { CUSTOM_ELEMENTS_SCHEMA, Pipe, PipeTransform } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { QueryCreateContext } from '../../models';
import { QueryConfirmationComponent } from './query-confirmation.component';

@Pipe({ name: 'rpxTranslate' })
class RpxTranslateMockPipe implements PipeTransform {
  public transform(value: string, args?: any): string {
    return value;
  }
}

describe('QueryConfirmationComponent', () => {
  let component: QueryConfirmationComponent;
  let fixture: ComponentFixture<QueryConfirmationComponent>;
  let nativeElement: any;

  const mockRoute = {
    snapshot: {
      params: {
        cid: '1234'
      }
    }
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [
        QueryConfirmationComponent,
        RpxTranslateMockPipe
      ],
      imports: [RouterTestingModule],
      providers: [
        { provide: ActivatedRoute, useValue: mockRoute }
      ]
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
