import { Component, DestroyRef, Input, OnInit, ViewChild, inject, signal } from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatTabsModule } from '@angular/material/tabs';
import { NgxJsonViewerModule } from 'ngx-json-viewer-ng';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReplaySubject, filter, startWith } from 'rxjs';
import { filterGuides } from '../../utils/filter';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

@Component({
  selector: 'app-eightyfive',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule,
    NgxJsonViewerModule, MatGridListModule, MatTabsModule,
    MatSelectModule, NgxMatSelectSearchModule
  ],
  templateUrl: './eightyfive.component.html',
  styleUrl: './eightyfive.component.scss'
})
export class EightyfiveComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  @Input() set data(value:any) {
    this._data = value
    const actions =  this._data?.structure?.steps
      .find((i: any) => i.uid === 'items')
      .action
    if (actions) {
      this.guides = actions?.items?.slice().sort((a: any, b: any) => a?.displayName?.localeCompare(b?.displayName))  || []
      this.filteredGuides.next(this.guides)
      this.languages = actions?.languages || []
      this.displaygroups = actions?.displayGroups || []
      // sort
      this.languages = this.languages?.sort((a: any, b: any) => a?.name?.toLowerCase() > b?.name?.toLowerCase() ? 1 : -1)
      this.displaygroups = this.displaygroups?.sort((a: any, b: any) => a?.name?.toLowerCase() > b?.name?.toLowerCase() ? 1 : -1)
    }
  }
  _data: any = {}
  guides: any[] = []
  languages: any[] = []
  displaygroups: any[] = []
  guides_d: any[] = []
  _languages = new FormControl([])
  _displaygroups = new FormControl([])
  _guides_d = new FormControl([])

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
    this.form.controls.guideFilterCtrl.valueChanges
      .pipe(
        takeUntilDestroyed(),
        startWith(''))
      .subscribe(search => {
        this.filteredGuides.next(filterGuides(this.guides, search))
      });

      this.form.controls.guides.valueChanges
      .pipe(
        takeUntilDestroyed())
      .subscribe(value => {
        this.guide.set(value)
        const reqs = this.guides.find(i => i.apiName === value)//?.preReqs
        this.reqs.set(reqs)
        console.log('eightyfive.guide', value, reqs)
      })
    }

  public ngOnInit(): void {
    this._displaygroups
    .valueChanges
    .pipe(
        takeUntilDestroyed(this.destroyRef),
        filter(i => !!i))
    .subscribe(id => {
        console.log('displaygroup', id)
        this.guides_d = this.guides.filter(i => i.displayGroups[0] === id).map(i => i.apiName)
    })
  }
}
