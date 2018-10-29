import { Component, OnInit } from '@angular/core';
import '../style/app.scss';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html'
})
export class AppComponent  implements OnInit {
  ngOnInit() {
    console.log('oninit!!!!!!!!!!!!!!!!!!!!!')
}
}
