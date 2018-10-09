import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteOrCancelDialogComponent } from './delete-or-cancel-dialog.component';
import { MatDialogRef } from '@angular/material';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import createSpyObj = jasmine.createSpyObj;

describe('DeleteOrCancelDialogComponent', () => {
  const DELETE_BUTTON = By.css('button[title="Delete"]');
  const CANCEL_BUTTON = By.css('button[title="Cancel"]');

  let component: DeleteOrCancelDialogComponent;
  let fixture: ComponentFixture<DeleteOrCancelDialogComponent>;
  let de: DebugElement;
  let matDialogRef: any;

  beforeEach(async(() => {
    matDialogRef = createSpyObj<MatDialogRef<DeleteOrCancelDialogComponent>>('MatDialogRef', ['close']);

    TestBed.configureTestingModule({
      declarations: [ DeleteOrCancelDialogComponent ],
      providers: [
        { provide: MatDialogRef, useValue: matDialogRef }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeleteOrCancelDialogComponent);
    component = fixture.componentInstance;
    de = fixture.debugElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should close dialog with `Delete` when delete button clicked', () => {
    let deleteButton = de.query(DELETE_BUTTON);

    deleteButton.nativeElement.click();
    fixture.detectChanges();

    expect(matDialogRef.close).toHaveBeenCalledWith('Delete');
  });

  it('should close dialog with `Cancel` when cancel button clicked', () => {
    let removeButton = de.query(CANCEL_BUTTON);

    removeButton.nativeElement.click();
    fixture.detectChanges();

    expect(matDialogRef.close).toHaveBeenCalledWith('Cancel');
  });
});
