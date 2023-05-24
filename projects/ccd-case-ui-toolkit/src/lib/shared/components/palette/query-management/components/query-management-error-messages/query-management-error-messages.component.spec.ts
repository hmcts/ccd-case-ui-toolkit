import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QueryManagementErrorMessage } from './query-management-error-message.model';
import { QueryManagementErrorMessagesComponent } from './query-management-error-messages.component';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'rpxTranslate' })
class RpxTranslateMockPipe implements PipeTransform {
  transform(value: string): string {
    return value;
  }
}

describe('QueryManagementErrorMessagesComponent', () => {
  let component: QueryManagementErrorMessagesComponent;
  let fixture: ComponentFixture<QueryManagementErrorMessagesComponent>;
  let mockErrorMessages: QueryManagementErrorMessage[] = [];

  beforeEach(async () => {
    mockErrorMessages = [
      {
        controlName: 'response',
        message: 'Add a response before continue'
      },
      {
        controlName: 'documents',
        message: 'Add a document before continue'
      }
    ];
    await TestBed.configureTestingModule({
      declarations: [
        QueryManagementErrorMessagesComponent,
        RpxTranslateMockPipe
      ],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QueryManagementErrorMessagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display error messages', () => {
    component.errorMessages = mockErrorMessages;
    fixture.detectChanges();
    const errorMessages = fixture.nativeElement.querySelectorAll('.govuk-error-summary__list > li');
    expect(errorMessages.length).toBe(2);
    expect(errorMessages[0].textContent).toContain('Add a response before continue');
    expect(errorMessages[1].textContent).toContain('Add a document before continue');
  });

  it('should not display error messages', () => {
    component.errorMessages = [];
    fixture.detectChanges();
    const errorMessages = fixture.nativeElement.querySelectorAll('.govuk-error-message');
    expect(errorMessages.length).toBe(0);
  });
});
