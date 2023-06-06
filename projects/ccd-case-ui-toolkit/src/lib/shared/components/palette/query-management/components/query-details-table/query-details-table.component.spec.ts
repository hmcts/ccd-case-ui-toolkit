import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QueryDetailsTableComponent } from './query-details-table.component';

describe('QueryDetailsTableComponent', () => {
  let component: QueryDetailsTableComponent;
  let fixture: ComponentFixture<QueryDetailsTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QueryDetailsTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QueryDetailsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
