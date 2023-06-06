import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { QueryListItem } from './models';
import { ReadQueryManagementFieldComponent } from './read-query-management-field.component';

describe('ReadQueryManagementFieldComponent', () => {
  let component: ReadQueryManagementFieldComponent;
  let fixture: ComponentFixture<ReadQueryManagementFieldComponent>;

  const mockRoute = {
    snapshot: {
      data: {
        case: {
          tabs: [
            {
              id: 'Data',
              fields: []
            },
            {
              id: 'History',
              fields: []
            },
            {
              id: 'QueryManagement',
            }
          ]
        }
      }
    }
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [ReadQueryManagementFieldComponent],
      imports: [RouterTestingModule],
      providers: [
        { provide: ActivatedRoute, useValue: mockRoute }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReadQueryManagementFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should hide query list and show query detiails', () => {
    component.setQuery(new QueryListItem());
    expect(component.showQueryList).toBeFalsy();
    expect(component.query).toEqual(new QueryListItem())
  });
});
