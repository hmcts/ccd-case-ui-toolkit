/* import { NgxMatDatetimePickerModule, NgxMatNativeDateModule, NgxMatTimepickerModule } from "@angular-material-components/datetime-picker";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { MatDatepickerModule, MatFormFieldModule, MatInputModule } from "@angular/material";
import { FormatTranslatorService } from "../../../services/case-fields/format-translator.service";
import { DatetimePickerWrapperComponent } from "./datetime-picker-wrapper.component";


describe('DatetimePickerWrapperComponent', () => {

  let component: DatetimePickerWrapperComponent;
  let fixture: ComponentFixture<DatetimePickerWrapperComponent>;
    
  beforeEach((() => {
    TestBed.configureTestingModule({
          imports: [
            NgxMatDatetimePickerModule,
            NgxMatTimepickerModule,
            NgxMatNativeDateModule,
            MatFormFieldModule,
            MatInputModule,
            MatDatepickerModule
          ],
          declarations: [
            DatetimePickerWrapperComponent,
          ],
          providers: [FormatTranslatorService]
        })
        .compileComponents();

      fixture = TestBed.createComponent(DatetimePickerWrapperComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    }));

    it('should create', () => {
      expect(component).toBeDefined();
    });
}); */