import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SaveOrDiscardDialogComponent } from './save-or-discard-dialog.component';
import { MatDialogRef } from '@angular/material';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
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
    let saveButton = de.query(SAVE_BUTTON);

    saveButton.nativeElement.click();
    fixture.detectChanges();

    expect(matDialogRef.close).toHaveBeenCalledWith('Save');
  });

  it('should close dialog with `Discard` when cancel button clicked', () => {
    let discardButton = de.query(DISCARD_BUTTON);

    discardButton.nativeElement.click();
    fixture.detectChanges();

    expect(matDialogRef.close).toHaveBeenCalledWith('Discard');
  });
});
