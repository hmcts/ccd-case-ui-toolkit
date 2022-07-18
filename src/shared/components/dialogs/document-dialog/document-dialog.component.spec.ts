import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MatDialogRef } from '@angular/material/dialog';
import { DocumentDialogComponent } from './document-dialog.component';

describe('DocumentDialogComponent', () => {
  let component: DocumentDialogComponent;
  let fixture: ComponentFixture<DocumentDialogComponent>;
  let matDialogRef: MatDialogRef<DocumentDialogComponent>;

  beforeEach(waitForAsync(() => {
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
