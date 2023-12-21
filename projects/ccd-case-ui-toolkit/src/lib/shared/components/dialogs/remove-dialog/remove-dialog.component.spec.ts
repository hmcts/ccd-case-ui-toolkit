import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DebugElement } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import { RemoveDialogComponent } from './remove-dialog.component';
import createSpyObj = jasmine.createSpyObj;

describe('RemoveDialogComponent', () => {
  const REMOVE_BUTTON = By.css('button[title="Remove"]');
  const CANCEL_BUTTON = By.css('button[title="Cancel"]');

  let component: RemoveDialogComponent;
  let fixture: ComponentFixture<RemoveDialogComponent>;
  let de: DebugElement;
  let matDialogRef: any;

  beforeEach(waitForAsync(() => {
    matDialogRef = createSpyObj<MatDialogRef<RemoveDialogComponent>>('MatDialogRef', ['close']);

    TestBed.configureTestingModule({
      declarations: [ RemoveDialogComponent ],
      providers: [
        { provide: MatDialogRef, useValue: matDialogRef }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RemoveDialogComponent);
    component = fixture.componentInstance;
    de = fixture.debugElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should close dialog with `Remove` when remove button clicked', () => {
    const removeButton = de.query(REMOVE_BUTTON);

    removeButton.nativeElement.click();
    fixture.detectChanges();

    expect(matDialogRef.close).toHaveBeenCalledWith('Remove');
  });

  it('should close dialog with `Cancel` when cancel button clicked', () => {
    const removeButton = de.query(CANCEL_BUTTON);

    removeButton.nativeElement.click();
    fixture.detectChanges();

    expect(matDialogRef.close).toHaveBeenCalledWith('Cancel');
  });
});
