import { CUSTOM_ELEMENTS_SCHEMA, Pipe, PipeTransform } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
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
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should initialise the component and set queryItem', () => {
      component.ngOnInit();
      expect(component.queryItem).toBeDefined();
    });
  });
});

