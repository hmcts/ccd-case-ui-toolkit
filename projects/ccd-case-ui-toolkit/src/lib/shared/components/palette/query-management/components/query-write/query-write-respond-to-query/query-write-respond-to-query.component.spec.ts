import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QueryWriteRespondToQueryComponent } from './query-write-respond-to-query.component';

describe('QueryWriteRespondToQueryComponent', () => {
  let component: QueryWriteRespondToQueryComponent;
  let fixture: ComponentFixture<QueryWriteRespondToQueryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QueryWriteRespondToQueryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QueryWriteRespondToQueryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
