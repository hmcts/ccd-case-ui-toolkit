import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MatDialogRef } from '@angular/material/dialog';
import { MockRpxTranslatePipe } from '../../../test/mock-rpx-translate.pipe';
import { DocumentDialogComponent } from './document-dialog.component';

describe('DocumentDialogComponent', () => {
  let component: DocumentDialogComponent;
  let fixture: ComponentFixture<DocumentDialogComponent>;
  const matDialogRef = jasmine.createSpyObj<MatDialogRef<DocumentDialogComponent>>('matDialogRef', ['afterClosed', 'close']);


  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DocumentDialogComponent, MockRpxTranslatePipe ],
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
