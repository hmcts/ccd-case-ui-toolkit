import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { QueryWriteDateInputComponent } from './query-write-date-input.component';

describe('QueryWriteDateInputComponent', () => {
  let component: QueryWriteDateInputComponent;
  let fixture: ComponentFixture<QueryWriteDateInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [QueryWriteDateInputComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QueryWriteDateInputComponent);
    component = fixture.componentInstance;
    // Call the register as CVA does
    component.registerOnChange((value: Date) => {});
    component.registerOnTouched(() => {});
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('writeValue', () => {
    it('should reset values to null when writeValue is called with an invalid date', () => {
      const date = new Date('invalid');
      component.day = 10;
      component.month = 5;
      component.year = 2022;

      component.writeValue(date);

      expect(component.day).toBeNull();
      expect(component.month).toBeNull();
      expect(component.year).toBeNull();
    });
  });


  describe('updateDate', () => {
    it('should invoke onChange and onTouched when updateDate is called with a valid date input', () => {
      // @ts-expect-error - private method
      const onChangeSpy = spyOn(component, 'onChange');
      // @ts-expect-error - private method
      const onTouchedSpy = spyOn(component, 'onTouched');
      component.day = 7;
      component.month = 6;
      component.year = 2023;

      component.updateDate();

      expect(onChangeSpy).toHaveBeenCalledWith(new Date(2023, 5, 7));
      expect(onTouchedSpy).toHaveBeenCalled();
    });

    it('should invoke onChange with null when updateDate is called with an invalid date input', () => {
      // @ts-expect-error - private method
      const onChangeSpy = spyOn(component, 'onChange');
      // @ts-expect-error - private method
      const onTouchedSpy = spyOn(component, 'onTouched');
      component.day = 35;
      component.month = 15;
      component.year = -1;

      component.updateDate();

      expect(onChangeSpy).toHaveBeenCalledWith(null);
      expect(onTouchedSpy).toHaveBeenCalled();
    });
  });

  describe('isValidDateInput', () => {
    it('should return true for isValidDateInput when day, month, and year are valid', () => {
      component.day = 7;
      component.month = 6;
      component.year = 2023;

      // @ts-expect-error
      const isValid = component.isValidDateInput();

      expect(isValid).toBe(true);
    });

    it('should return false for isValidDateInput when day is invalid', () => {
      component.day = 35;
      component.month = 6;
      component.year = 2023;

      // @ts-expect-error
      const isValid = component.isValidDateInput();

      expect(isValid).toBe(false);
    });

    it('should return false for isValidDateInput when month is invalid', () => {
      component.day = 7;
      component.month = 15;
      component.year = 2023;

      // @ts-expect-error
      const isValid = component.isValidDateInput();

      expect(isValid).toBe(false);
    });

    it('should return false for isValidDateInput when year is invalid', () => {
      component.day = 7;
      component.month = 6;
      component.year = -1;

      // @ts-expect-error
      const isValid = component.isValidDateInput();

      expect(isValid).toBe(false);
    });
  });
});
