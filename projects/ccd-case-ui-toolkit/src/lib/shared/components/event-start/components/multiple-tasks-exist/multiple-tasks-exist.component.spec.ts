import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { RpxTranslationModule } from 'rpx-xui-translation';
import { MultipleTasksExistComponent } from './multiple-tasks-exist.component';

describe('MultipleTasksExistComponent', () => {
  let component: MultipleTasksExistComponent;
  let fixture: ComponentFixture<MultipleTasksExistComponent>;
  const mockRoute: any = {
    snapshot: {
      data: {
        case: {
          case_id: '1620409659381330'
        }
      }
    }
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        RpxTranslationModule.forRoot({ baseUrl: '', debounceTimeMs: 300, testMode: true, validity: { days: 1 }})
      ],
      declarations: [MultipleTasksExistComponent],
      providers: [
        {provide: ActivatedRoute, useValue: mockRoute}
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
});
