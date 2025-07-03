import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { MockRpxTranslatePipe } from '../../../../test/mock-rpx-translate.pipe';
import { MultipleTasksExistComponent } from './multiple-tasks-exist.component';
import { LoadingService } from '../../../../services/loading/loading.service';

describe('MultipleTasksExistComponent', () => {
  let component: MultipleTasksExistComponent;
  let fixture: ComponentFixture<MultipleTasksExistComponent>;
  let mockLoadingService: jasmine.SpyObj<LoadingService>;
  mockLoadingService = jasmine.createSpyObj('LoadingService', ['hasSharedSpinner', 'unregisterSharedSpinner']);
  const mockRoute: any = {
    snapshot: {
      data: {
        case: {
          case_id: '1620409659381330',
          case_type: {
            id: 'TestCaseType',
            jurisdiction: {
              id: 'TestJurisdiction'
            }
          }
        }
      }
    }
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [MultipleTasksExistComponent, MockRpxTranslatePipe],
      providers: [
        {provide: ActivatedRoute, useValue: mockRoute},
        { provide: LoadingService, useValue: mockLoadingService }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MultipleTasksExistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should display error message multiple-tasks-exist', () => {
    const heading: DebugElement = fixture.debugElement.query(By.css('.govuk-heading-m'));
    const headingHtml = heading.nativeElement as HTMLElement;
    expect(headingHtml.innerText).toBe('Multiple tasks exist');
  });

  it('should not call unregisterSharedSpinner if hasSharedSpinner returns false', () => {
    mockLoadingService.hasSharedSpinner.and.returnValue(false);

    component.ngOnInit();

    expect(mockLoadingService.hasSharedSpinner).toHaveBeenCalled();
    expect(mockLoadingService.unregisterSharedSpinner).not.toHaveBeenCalled();
  });

  it('should call unregisterSharedSpinner if hasSharedSpinner returns true', () => {
    mockLoadingService.hasSharedSpinner.and.returnValue(true);

    component.ngOnInit();

    expect(mockLoadingService.hasSharedSpinner).toHaveBeenCalled();
    expect(mockLoadingService.unregisterSharedSpinner).toHaveBeenCalled();
  });
});
