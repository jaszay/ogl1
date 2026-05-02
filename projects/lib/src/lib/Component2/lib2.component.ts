import { Component } from '@angular/core';
import { LibComponentF } from '../Component1/lib.component';

@Component({
  selector: 'lib-lib2-f2',
  standalone: true,
  imports: [LibComponentF],
  template: `
    <p>
      libf2 works!
    </p>
    <lib-lib-f>/</lib-lib-f>
  `,
  styles: ``
})
export class LibComponentF2 {

}
