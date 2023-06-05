import { CUSTOM_ELEMENTS_SCHEMA, Pipe, PipeTransform } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CaseField } from '../../../domain';
import { WriteQueryManagementFieldComponent } from './write-query-management-field.component';

@Pipe({ name: 'ccdCaseReference' })
class CcdCaseReferenceMockPipe implements PipeTransform {
  public transform(value: string, args?: any): string {
    return value;
  }
}

@Pipe({ name: 'rpxTranslate' })
class RpxTranslateMockPipe implements PipeTransform {
  public transform(value: string, args?: any): string {
    return value;
  }
}

describe('WriteQueryManagementFieldComponent', () => {
  let component: WriteQueryManagementFieldComponent;
  let fixture: ComponentFixture<WriteQueryManagementFieldComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [
        WriteQueryManagementFieldComponent,
        CcdCaseReferenceMockPipe,
        RpxTranslateMockPipe
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WriteQueryManagementFieldComponent);
    component = fixture.componentInstance;
    component.caseField = {
      id: 'WriteQueryManagementField',
      metadata: false
    } as CaseField;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('showResponseForm - should not show summary', () => {
    component.showResponseForm()
    expect(component.showSummary).toBeFalsy();
  });

  it('confirmDetails - should show summary', () => {
    component.confirmDetails()
    expect(component.showSummary).toBeTruthy();
  });
});

