import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RemoveDialogComponent } from './remove-dialog.component';
import { MatDialogRef } from '@angular/material';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import createSpyObj = jasmine.createSpyObj;

describe('RemoveDialogComponent', () => {
  const REMOVE_BUTTON = By.css('button[title="Remove"]');
  const CANCEL_BUTTON = By.css('button[title="Cancel"]');

  let component: RemoveDialogComponent;
  let fixture: ComponentFixture<RemoveDialogComponent>;
  let de: DebugElement;
  let matDialogRef: any;

  beforeEach(async(() => {
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
    let removeButton = de.query(REMOVE_BUTTON);

    removeButton.nativeElement.click();
    fixture.detectChanges();

    expect(matDialogRef.close).toHaveBeenCalledWith('Remove');
  });

  it('should close dialog with `Cancel` when cancel button clicked', () => {
    let removeButton = de.query(CANCEL_BUTTON);

    removeButton.nativeElement.click();
    fixture.detectChanges();

    expect(matDialogRef.close).toHaveBeenCalledWith('Cancel');
  });
});
