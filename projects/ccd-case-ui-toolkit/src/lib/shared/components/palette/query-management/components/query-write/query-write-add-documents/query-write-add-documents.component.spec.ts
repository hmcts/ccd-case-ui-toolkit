import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QueryWriteAddDocumentsComponent } from './query-write-add-documents.component';

describe('QueryWriteAddDocumentsComponent', () => {
  let component: QueryWriteAddDocumentsComponent;
  let fixture: ComponentFixture<QueryWriteAddDocumentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QueryWriteAddDocumentsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QueryWriteAddDocumentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
