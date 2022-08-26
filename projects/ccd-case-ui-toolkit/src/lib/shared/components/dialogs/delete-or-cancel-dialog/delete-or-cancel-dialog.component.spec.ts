import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DebugElement } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import { DeleteOrCancelDialogComponent } from './delete-or-cancel-dialog.component';
import createSpyObj = jasmine.createSpyObj;
import { RpxTranslationModule } from 'rpx-xui-translation';

describe('DeleteOrCancelDialogComponent', () => {
  const DELETE_BUTTON = By.css('button[title="Delete"]');
  const CANCEL_BUTTON = By.css('button[title="Cancel"]');

  let component: DeleteOrCancelDialogComponent;
  let fixture: ComponentFixture<DeleteOrCancelDialogComponent>;
  let de: DebugElement;
  let matDialogRef: any;

  beforeEach(waitForAsync(() => {
    matDialogRef = createSpyObj<MatDialogRef<DeleteOrCancelDialogComponent>>('MatDialogRef', ['close']);

    TestBed.configureTestingModule({
      imports: [
        RpxTranslationModule.forRoot({ baseUrl: '', debounceTimeMs: 300, testMode: true, validity: { days: 1 }})
      ],
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
    const deleteButton = de.query(DELETE_BUTTON);

    deleteButton.nativeElement.click();
    fixture.detectChanges();

    expect(matDialogRef.close).toHaveBeenCalledWith('Delete');
  });

  it('should close dialog with `Cancel` when cancel button clicked', () => {
    const removeButton = de.query(CANCEL_BUTTON);

    removeButton.nativeElement.click();
    fixture.detectChanges();

    expect(matDialogRef.close).toHaveBeenCalledWith('Cancel');
  });
});
