import { FormErrorService } from './form-error.service';
import { FormControl, FormGroup } from '@angular/forms';

describe('FormErrorService', () => {

  const FIELD_1 = 'Field1';
  const FIELD_2 = 'Field2';
  const FIELD_3 = 'Field3';
  const NESTED_FIELD = 'Field1.Field2.Field3';

  const MESSAGE_1 = 'Some first message';
  const MESSAGE_2 = 'Some second message';

  const ERROR_KEY = 'validation';

  let formErrorService: FormErrorService;

  beforeEach(() => {
    formErrorService = new FormErrorService();
  });

  describe('mapFieldErrors', () => {
    it('should map simple error to associated form control', () => {
      let errors = [
        {
          id: FIELD_1,
          message: MESSAGE_1
        }
      ];

      let form = new FormGroup({
        [FIELD_1]: new FormControl()
      });

      formErrorService.mapFieldErrors(errors, form, ERROR_KEY);

      expect(form.controls[FIELD_1].errors[ERROR_KEY]).toBe(MESSAGE_1);
    });

    it('should map multiple simple errors', () => {
      let errors = [
        {
          id: FIELD_1,
          message: MESSAGE_1
        },
        {
          id: FIELD_2,
          message: MESSAGE_2
        }
      ];

      let form = new FormGroup({
        [FIELD_1]: new FormControl(),
        [FIELD_2]: new FormControl()
      });

      formErrorService.mapFieldErrors(errors, form, ERROR_KEY);

      expect(form.controls[FIELD_1].errors[ERROR_KEY]).toBe(MESSAGE_1);
      expect(form.controls[FIELD_2].errors[ERROR_KEY]).toBe(MESSAGE_2);
    });

    it('should map nested errors', () => {
      let errors = [
        {
          id: NESTED_FIELD,
          message: MESSAGE_1
        }
      ];

      let form = new FormGroup({
        [FIELD_1]: new FormGroup({
          [FIELD_2]: new FormGroup({
            [FIELD_3]: new FormControl()
          })
        })
      });

      formErrorService.mapFieldErrors(errors, form, ERROR_KEY);

      expect(((form
        .controls[FIELD_1] as FormGroup)
        .controls[FIELD_2] as FormGroup)
        .controls[FIELD_3].errors[ERROR_KEY]).toBe(MESSAGE_1);
    });

    it('should ignore simple errors for unknown fields', () => {
      let errors = [
        {
          id: FIELD_2,
          message: MESSAGE_1
        }
      ];

      let form = new FormGroup({
        [FIELD_1]: new FormControl()
      });

      formErrorService.mapFieldErrors(errors, form, ERROR_KEY);

      expect(form.controls[FIELD_1].errors).toBeNull();
    });

    it('should ignore empty errors', () => {
      let errors = [];

      let form = new FormGroup({
        [FIELD_1]: new FormControl()
      });

      formErrorService.mapFieldErrors(errors, form, ERROR_KEY);

      expect(form.controls[FIELD_1].errors).toBeNull();
    });

    it('should ignore nested errors for unknown fields', () => {
      let errors = [
        {
          id: FIELD_1 + '.' + FIELD_3,
          message: MESSAGE_1
        }
      ];

      let form = new FormGroup({
        [FIELD_1]: new FormGroup({
          [FIELD_2]: new FormControl()
        })
      });

      formErrorService.mapFieldErrors(errors, form, ERROR_KEY);

      expect(form.controls[FIELD_1].errors).toBeNull();
      expect((form
        .controls[FIELD_1] as FormGroup)
        .controls[FIELD_2].errors).toBeNull();
    });

    it('should ignore nested errors for unknown group', () => {
      let errors = [
        {
          id: FIELD_3 + '.' + FIELD_3 + '.' + FIELD_3,
          message: MESSAGE_1
        }
      ];

      let form = new FormGroup({
        [FIELD_1]: new FormGroup({
          [FIELD_2]: new FormGroup({
            [FIELD_3]: new FormControl()
          })
        })
      });

      formErrorService.mapFieldErrors(errors, form, ERROR_KEY);

      expect(form.controls[FIELD_1].errors).toBeNull();
      expect((form
        .controls[FIELD_1] as FormGroup)
        .controls[FIELD_2].errors).toBeNull();
      expect(((form
        .controls[FIELD_1] as FormGroup)
        .controls[FIELD_2] as FormGroup)
        .controls[FIELD_3].errors).toBeNull();
    });

    it('should reset all errors', () => {
      let field3 = new FormControl();

      let form = new FormGroup({
        [FIELD_1]: new FormGroup({
          [FIELD_2]: new FormGroup({
            [FIELD_3]: field3
          })
        })
      });

      form.controls[FIELD_1].setErrors({ x: 'y' });

      field3.setErrors({ q: 'z' });

      form.reset();

      expect(form.controls[FIELD_1].errors).toBeNull();
      expect(field3.errors).toBeNull();

    });
  });
});
