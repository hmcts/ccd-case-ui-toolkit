import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { UpdateFlagWelshTranslationFormComponent } from './update-flag-welsh-translation-form.component';

describe('UpdateFlagWelshTranslationFormComponent', () => {
  let component: UpdateFlagWelshTranslationFormComponent;
  let fixture: ComponentFixture<UpdateFlagWelshTranslationFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UpdateFlagWelshTranslationFormComponent ],
      imports: [ ReactiveFormsModule ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdateFlagWelshTranslationFormComponent);
    component = fixture.componentInstance;
    component.formGroup = new FormGroup({});
    component.formGroup.addControl(component.FLAG_COMMENTS_CONTROL_NAME, new FormControl(''));
    component.formGroup.addControl(component.FLAG_STATUS_CHANGE_REASON_CONTROL_NAME, new FormControl(''));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should add two form controls if formGroup exists', () => {
    expect(component.formGroup.get(component.FLAG_COMMENTS_WELSH_CONTROL_NAME)).toBeTruthy();
    expect(component.formGroup.get(component.FLAG_STATUS_CHANGE_REASON_WELSH_CONTROL_NAME)).toBeTruthy();
  });

  it('should have all four textareas based on names and the English textiareas  should be readonly', () => {
    const flagCommentsControl = fixture.debugElement.query(By.css(`#${component.FLAG_COMMENTS_CONTROL_NAME}`));
    expect(flagCommentsControl?.name).toEqual('textarea');
    expect(Object.keys(flagCommentsControl.attributes)).toContain('readonly');

    const flagCommentsWelshControl = fixture.debugElement.query(By.css(`#${component.FLAG_COMMENTS_WELSH_CONTROL_NAME}`));
    expect(flagCommentsWelshControl?.name).toEqual('textarea');

    const flagStatusChangeReasonControl = fixture.debugElement.query(By.css(`#${component.FLAG_STATUS_CHANGE_REASON_CONTROL_NAME}`));
    expect(flagStatusChangeReasonControl?.name).toEqual('textarea');
    expect(Object.keys(flagStatusChangeReasonControl.attributes)).toContain('readonly');

    const flagStatusChangeReasonWelshControl = fixture.debugElement.query(By.css(`#${component.FLAG_STATUS_CHANGE_REASON_WELSH_CONTROL_NAME}`));
    expect(flagStatusChangeReasonWelshControl?.name).toEqual('textarea');
  });
});
