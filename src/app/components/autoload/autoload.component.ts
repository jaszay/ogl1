import { Component, Input, Signal, ViewChild, effect, signal } from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatTabsModule } from '@angular/material/tabs';
import { NgxJsonViewerModule } from 'ngx-json-viewer-ng';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ReplaySubject, startWith } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filterGuides } from '../../utils/filter';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

@Component({
  selector: 'app-autoload',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule,
    NgxJsonViewerModule, MatGridListModule, MatTabsModule,
    MatSelectModule, NgxMatSelectSearchModule
  ],
  templateUrl: './autoload.component.html',
  styleUrl: './autoload.component.scss'
})
export class AutoloadComponent {
  @Input() set data(value:any) {
    this._data.set(value)
    const steps =  this._data()?.structure?.steps
    if (steps) {
      const _steps = steps.filter((i: any) => i.followers?.length === 1 &&
        !['85grcrxsh', 'hotspots'].includes(i.followers[0].nextScenario))
      const guides: any[] = []
      _steps.forEach((i: any) => {
        guides.push({ ...i, apiName: i.followers[0].nextScenario, 
          displayName: i.followers[0].nextScenario })
      });
      this.guides = guides.slice().sort((a, b) => a.displayName.localeCompare(b.displayName))
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
        console.log('autoload.guide', value, reqs)
      })  
    }
  }
