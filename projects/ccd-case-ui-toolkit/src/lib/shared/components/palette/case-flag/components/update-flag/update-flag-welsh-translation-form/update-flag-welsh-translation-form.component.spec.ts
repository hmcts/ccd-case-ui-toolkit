import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { CaseFlagFormFields } from '../../../enums/case-flag-form-fields.enum';
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
    component.formGroup.addControl(CaseFlagFormFields.COMMENTS, new FormControl(''));
    component.formGroup.addControl(CaseFlagFormFields.OTHER_FLAG_DESCRIPTION, new FormControl(''));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should add two form controls if formGroup exists', () => {
    expect(component.formGroup.get(CaseFlagFormFields.COMMENTS_WELSH)).toBeTruthy();
    expect(component.formGroup.get(CaseFlagFormFields.OTHER_FLAG_DESCRIPTION_WELSH)).toBeTruthy();
  });

  it('should have all four textareas based on names', () => {
    const flagStatusChangeReasonControl = fixture.debugElement.query(By.css(`#${CaseFlagFormFields.OTHER_FLAG_DESCRIPTION}`));
    expect(flagStatusChangeReasonControl?.name).toEqual('textarea');

    const flagStatusChangeReasonWelshControl = fixture.debugElement.query(By.css(`#${CaseFlagFormFields.OTHER_FLAG_DESCRIPTION_WELSH}`));
    expect(flagStatusChangeReasonWelshControl?.name).toEqual('textarea');

    const flagCommentsControl = fixture.debugElement.query(By.css(`#${CaseFlagFormFields.COMMENTS}`));
    expect(flagCommentsControl?.name).toEqual('textarea');

    const flagCommentsWelshControl = fixture.debugElement.query(By.css(`#${CaseFlagFormFields.COMMENTS_WELSH}`));
    expect(flagCommentsWelshControl?.name).toEqual('textarea');
  });
});
