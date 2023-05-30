import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QueryWriteRaiseQueryComponent } from './query-write-raise-query.component';

describe('QueryWriteRaiseQueryComponent', () => {
  let component: QueryWriteRaiseQueryComponent;
  let fixture: ComponentFixture<QueryWriteRaiseQueryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QueryWriteRaiseQueryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QueryWriteRaiseQueryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
