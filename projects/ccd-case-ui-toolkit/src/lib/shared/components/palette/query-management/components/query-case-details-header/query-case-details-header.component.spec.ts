import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QueryCaseDetailsHeaderComponent } from './query-case-details-header.component';

describe('QueryCaseDetailsHeaderComponent', () => {
  let component: QueryCaseDetailsHeaderComponent;
  let fixture: ComponentFixture<QueryCaseDetailsHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QueryCaseDetailsHeaderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QueryCaseDetailsHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
