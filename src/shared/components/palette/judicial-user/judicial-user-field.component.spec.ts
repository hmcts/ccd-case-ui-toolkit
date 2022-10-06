import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { JudicialUserFieldComponent } from './judicial-user-field.component';

describe('JudicialUserFieldComponent', () => {
  let fixture: ComponentFixture<JudicialUserFieldComponent>;
  let component: JudicialUserFieldComponent;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [],
      declarations: [JudicialUserFieldComponent],
      providers: []
    })
    .compileComponents();

    fixture = TestBed.createComponent(JudicialUserFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
