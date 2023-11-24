import { Component, CUSTOM_ELEMENTS_SCHEMA, Pipe, PipeTransform } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { QueryListItem } from './models';
import { ReadQueryManagementFieldComponent } from './read-query-management-field.component';

@Component({
  selector: 'dummy-component',
  template: ``
})
class DummyComponent { }

@Pipe({ name: 'rpxTranslate' })
class MockTranslatePipe implements PipeTransform {
  public transform(value: any, ...args: any[]): any {
    return value;
  }
}

describe('ReadQueryManagementFieldComponent', () => {
  let component: ReadQueryManagementFieldComponent;
  let fixture: ComponentFixture<ReadQueryManagementFieldComponent>;
  const caseId = '12345';
  const mockRoute = {
    snapshot: {
      params: {
        cid: caseId
      },
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
  let router: Router;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [
        ReadQueryManagementFieldComponent,
        MockTranslatePipe
      ],
      imports: [RouterTestingModule.withRoutes([
        {
          path: ``,
          component: DummyComponent
        },
        {
          path: `query-management/query/${caseId}/4`,
          component: DummyComponent
        },
      ])],
      providers: [
        { provide: ActivatedRoute, useValue: mockRoute }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReadQueryManagementFieldComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should hide query list and show query details', () => {
    component.setQuery(new QueryListItem());
    expect(component.showQueryList).toBeFalsy();
    expect(component.query).toEqual(new QueryListItem());
  });

  describe('query is set', () => {
    beforeEach(() => {
      component.setQuery(new QueryListItem());
      fixture.detectChanges();
    });

    describe('follow-up button', () => {
      it('should not display if query has no children', () => {
        component.query.children = [];
        fixture.detectChanges();
        const followUpButton = fixture.nativeElement.querySelector('#ask-follow-up-question');
        expect(followUpButton).toBeFalsy();
      });

      it('should display and navigate to query details page on click', fakeAsync(() => {
        component.query.children = [new QueryListItem()];
        fixture.detectChanges();
        spyOn(router, 'navigate');
        const followUpButton = fixture.nativeElement.querySelector('#ask-follow-up-question');
        followUpButton.click();
        tick();
        expect(router.url).toBe(`/query-management/query/${caseId}/4`);
      }));
    });
  });
});
