import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QueryEventCompletionComponent } from './query-event-completion.component';

describe('QueryEventCompletionComponent', () => {
  let component: QueryEventCompletionComponent;
  let fixture: ComponentFixture<QueryEventCompletionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QueryEventCompletionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QueryEventCompletionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
