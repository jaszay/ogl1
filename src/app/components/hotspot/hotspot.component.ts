import { Component, Input, ViewChild, effect, signal } from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatTabsModule } from '@angular/material/tabs';
import { NgxJsonViewerModule } from 'ngx-json-viewer-ng';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { filterGuides } from '../../utils/filter';
import { ReplaySubject, startWith } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

@Component({
  selector: 'app-hotspot',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule,
    NgxJsonViewerModule, MatGridListModule, MatTabsModule,
    MatSelectModule, NgxMatSelectSearchModule
  ],
  templateUrl: './hotspot.component.html',
  styleUrl: './hotspot.component.scss'
})
export class HotspotComponent {
  @Input() set data(value:any) {
    this._data.set(value)
    const steps =  this._data()?.structure?.steps
    if (steps) {
      const _steps = steps.filter((i: any) => i.id === 'hotspot' &&
        i.uid !== 'empty-step--not-hotspot')
      const guides: any[] = []
      _steps.forEach((i: any) => {
        guides.push({ ...i, apiName: i.uid, 
          displayName: i.uid })
      });
      this.guides = guides.sort((a, b) => a.displayName.localeCompare(b.displayName))
    }
  }
  @Input() set extra(value:any) {
    this._extra.set(value)
  }
  _data: any = signal({})
  _extra = signal([])
  guides: any[] = []
  languages: any[] = []
  _guides = new FormControl([])
  _languages = new FormControl([])

  guide: any = signal({})
  reqs: any = signal([])

  @ViewChild('singleSelect', { static: true }) singleSelect!: MatSelect;

  form = new FormGroup({
    //appId: new FormControl('', Validators.required),
    //tenancy: new FormControl(''),
    guides: new FormControl(''),
    guideFilterCtrl: new FormControl(''),
    //env: new FormControl(false)
  });
  public filteredGuides: ReplaySubject<any /*IGuide[]*/> =
  new ReplaySubject<any /*IGuide[]*/>(1);

  constructor() {
    effect(() => { 
      const data = this._data()
      const extra: any[] = this._extra()
      console.log("effect", "data", data, "extra", extra)

      if (data && Object.keys(data).length && extra.length) {
        this.guides = this.guides.map(i => ({ 
          ...i, 
          displayName: extra.find(j => j.apiName === i.apiName)?.displayName 
        }))
        this.filteredGuides.next(this.guides.slice())
      }
    })

    this.form.controls.guideFilterCtrl.valueChanges
      .pipe(
        takeUntilDestroyed(),
        startWith(''))
      .subscribe(search => {
        this.filteredGuides.next(filterGuides(this.guides, search))
      })

      this.form.controls.guides.valueChanges
      .pipe(
        takeUntilDestroyed())
      .subscribe(value => {
        this.guide.set(value)
        const reqs = this.guides.find(i => i.apiName === value)//?.preReqs
        this.reqs.set(reqs)
        console.log('hotspot.guide', value, reqs)
      })
    }
}
