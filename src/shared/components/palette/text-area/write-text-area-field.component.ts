import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { AbstractFieldWriteComponent } from '../base-field/abstract-field-write.component';

@Component({
  selector: 'ccd-write-text-area-field',
  templateUrl: './write-text-area-field.html'
})
export class WriteTextAreaFieldComponent extends AbstractFieldWriteComponent implements OnInit {

  textareaControl: FormControl;

  ngOnInit() {
    this.textareaControl = this.registerControl(new FormControl(this.caseField.value));
  }

  isIE(): boolean {
    return /msie\s|trident\/|edge\//i.test(window.navigator.userAgent);
  }

autoGrow(event) {
  if(this.isIE()){
    event.target.style.height = 'auto';
    event.target.style.height = event.target.scrollHeight+'px';
    event.target.scrollTop = event.target.scrollHeight; }
  }

}
