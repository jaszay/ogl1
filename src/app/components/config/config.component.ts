import { Component, Input } from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatTabsModule } from '@angular/material/tabs';
import { NgxJsonViewerModule } from 'ngx-json-viewer-ng';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-config',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, NgxJsonViewerModule, MatGridListModule, MatTabsModule, MatSelectModule],
  templateUrl: './config.component.html',
  styleUrl: './config.component.scss'
})
export class ConfigComponent {
  @Input() set data(value:any) {
    this._data = value
    const actions =  this._data?.structure?.steps
    .find((i: any) => i.uid === 'items')
    //.action
    if (actions) {
      this.guides = actions.items
      this.languages = actions.languages
    }
  }
  _data: any = {}
  guides: any[] = []
  languages: any[] = []
  _guides = new FormControl([])
  _languages = new FormControl([])
}
