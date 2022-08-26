import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MatDialogRef } from '@angular/material/dialog';
import { RpxTranslationModule } from 'rpx-xui-translation';
import { DocumentDialogComponent } from './document-dialog.component';

describe('DocumentDialogComponent', () => {
  let component: DocumentDialogComponent;
  let fixture: ComponentFixture<DocumentDialogComponent>;
  // tslint:disable-next-line: prefer-const
  let matDialogRef: MatDialogRef<DocumentDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        RpxTranslationModule.forRoot({ baseUrl: '', debounceTimeMs: 300, testMode: true, validity: { days: 1 }})
      ],
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
