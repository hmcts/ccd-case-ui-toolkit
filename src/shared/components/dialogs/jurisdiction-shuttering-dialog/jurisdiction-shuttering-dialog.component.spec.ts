import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JurisdictionShutteringDialogComponent } from './jurisdiction-shuttering-dialog.component';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import createSpyObj = jasmine.createSpyObj;
import { JurisdictionConfig } from '../../../domain';

describe('JurisdictionShutteringDialogComponent', () => {
  let component: JurisdictionShutteringDialogComponent;
  let fixture: ComponentFixture<JurisdictionShutteringDialogComponent>;
  let matDialogRef: any;
  let jurisdictionConfigsArr: JurisdictionConfig[] = [
    {
      id: 'Test1',
      shuttered: true
    },
    {
      id: 'Test2',
      shuttered: true
    },
    {
      id: 'Test3',
      shuttered: false
    }
  ]
  let mockedDialogData: any = {
    jurisdictionConfigs: jurisdictionConfigsArr
  }

  beforeEach(async(() => {
    matDialogRef = createSpyObj<MatDialogRef<JurisdictionShutteringDialogComponent>>('MatDialogRef', ['close']);

    TestBed.configureTestingModule({
      declarations: [ JurisdictionShutteringDialogComponent ],
      providers: [
        { provide: MatDialogRef, useValue: matDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: mockedDialogData }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JurisdictionShutteringDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
