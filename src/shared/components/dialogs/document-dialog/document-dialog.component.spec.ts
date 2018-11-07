import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentDialogComponent } from './document-dialog.component';
import { MatDialogRef } from '@angular/material';

describe('DocumentDialogComponent', () => {
  let component: DocumentDialogComponent;
  let fixture: ComponentFixture<DocumentDialogComponent>;
  let matDialogRef: MatDialogRef<DocumentDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocumentDialogComponent ],
      providers: [
        { provide: MatDialogRef, useValue: matDialogRef },
        DocumentDialogComponent
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
