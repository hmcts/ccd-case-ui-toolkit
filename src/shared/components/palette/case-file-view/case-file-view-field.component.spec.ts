import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CaseFileViewFieldComponent } from './case-file-view-field.component';

describe('CaseFileViewFieldComponent', () => {
  let component: CaseFileViewFieldComponent;
  let fixture: ComponentFixture<CaseFileViewFieldComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [],
      declarations: [
        CaseFileViewFieldComponent
      ],
      providers: []
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaseFileViewFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
