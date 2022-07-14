import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DebugElement } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import { SaveOrDiscardDialogComponent } from './save-or-discard-dialog.component';
import createSpyObj = jasmine.createSpyObj;

describe('SaveOrDiscardDialogComponent', () => {
  const SAVE_BUTTON = By.css('button[title="Save"]');
  const DISCARD_BUTTON = By.css('button[title="Discard"]');

  let component: SaveOrDiscardDialogComponent;
  let fixture: ComponentFixture<SaveOrDiscardDialogComponent>;
  let de: DebugElement;
  let matDialogRef: any;

  beforeEach(async(() => {
    matDialogRef = createSpyObj<MatDialogRef<SaveOrDiscardDialogComponent>>('MatDialogRef', ['close']);

    TestBed.configureTestingModule({
      declarations: [ SaveOrDiscardDialogComponent ],
      providers: [
        { provide: MatDialogRef, useValue: matDialogRef }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SaveOrDiscardDialogComponent);
    component = fixture.componentInstance;
    de = fixture.debugElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should close dialog with `Save` when delete button clicked', () => {
    const saveButton = de.query(SAVE_BUTTON);

    saveButton.nativeElement.click();
    fixture.detectChanges();

    expect(matDialogRef.close).toHaveBeenCalledWith('Save');
  });

  it('should close dialog with `Discard` when cancel button clicked', () => {
    const discardButton = de.query(DISCARD_BUTTON);

    discardButton.nativeElement.click();
    fixture.detectChanges();

    expect(matDialogRef.close).toHaveBeenCalledWith('Discard');
  });
});
