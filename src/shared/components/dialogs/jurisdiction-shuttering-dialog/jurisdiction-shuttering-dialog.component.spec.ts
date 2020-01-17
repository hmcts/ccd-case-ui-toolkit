import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JurisdictionShutteringDialogComponent } from './jurisdiction-shuttering-dialog.component';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import createSpyObj = jasmine.createSpyObj;
import { JurisdictionUIConfig } from '../../../domain';

describe('JurisdictionShutteringDialogComponent', () => {
  let component: JurisdictionShutteringDialogComponent;
  let fixture: ComponentFixture<JurisdictionShutteringDialogComponent>;
  let matDialogRef: any;
  let jurisdictionConfigsArr: JurisdictionUIConfig[] = [
    {
      id: 'Test1',
      shuttered: true,
      name: 'Test1'
    },
    {
      id: 'Test2',
      shuttered: true,
      name: 'Test2'
    },
    {
      id: 'Test3',
      shuttered: false,
      name: 'Test3'
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
