import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QueryEventCompletionComponent } from './query-event-completion.component';
import { MockComponent } from 'ng2-mock-component';

const queryEventCompletionComponentMock: any = MockComponent({
  selector: 'ccd-case-event-completion',
  inputs: ['eventCompletionParams']
});

describe('QueryEventCompletionComponent', () => {
  let component: QueryEventCompletionComponent;
  let fixture: ComponentFixture<QueryEventCompletionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QueryEventCompletionComponent, queryEventCompletionComponentMock ]
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
