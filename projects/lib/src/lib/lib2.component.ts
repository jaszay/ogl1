import { Component } from '@angular/core';
import { LibComponent } from './lib.component';

@Component({
  selector: 'lib-lib2',
  standalone: true,
  imports: [LibComponent],
  template: `
    <p>
      lib2 works!
    </p>
    <lib-lib>/</lib-lib>
  `,
  styles: ``
})
export class LibComponent2 {

}
