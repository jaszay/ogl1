import { Component, DestroyRef, Input, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatTabsModule } from '@angular/material/tabs';
import { NgxJsonViewerModule } from 'ngx-json-viewer-ng';

import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { Observable, ReplaySubject, catchError, filter, forkJoin, of, tap } from 'rxjs';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { GuideConditions } from '../../utils/conditions';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '../../../services/api.service';
import { MatButtonModule } from '@angular/material/button';
import { deepCopyObject } from '../../utils/utils';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { saveAs } from 'file-saver'

@Component({
  selector: 'app-guide',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, NgxMatSelectSearchModule, MatGridListModule, MatTabsModule, NgxJsonViewerModule, MatButtonModule, ClipboardModule],
  templateUrl: './guide.component.html',
  styleUrl: './guide.component.scss'
})
export class GuideComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);
  @Input() set data(value:any) {
    this._data = deepCopyObject(value)
    this.steps = this._data?.structure?.steps || []
    this.extra = value?.extra
    delete this._data.extra

    console.log('guides', 'set data', value, this.extra)
    this.updateGuideProperties()
  }
  
  screenshot = ''

  _data:any = {}
  steps:any[] = []
  _steps = new FormControl([])
  step: any = {}
  extra: any = {}

  selector = new FormControl('')
  conditions = new FormControl('')

  constructor(private http: HttpClient, private service: ApiService) {}

  public ngOnInit(): void {
    this._steps
    .valueChanges
    .pipe(
        takeUntilDestroyed(this.destroyRef),
        filter(i => !!i))
    .subscribe(id => {
        console.log('step', id)
        this.step = this.steps.find(i => i.uid === id) || this.steps.find(i => i.id === id)

        //this.updateStepProperties()
        const screenshotUrl = this.step.action.screenshot?.url
        if (screenshotUrl) {
          this.getScreenshot(screenshotUrl)
          .subscribe(i => {
            this.screenshot = i.screenshot
            this.cdr.markForCheck();
          })
        }
    })
  }
  
  updateGuideProperties = () => {
    this.updateStepProperties()
    if (this.extra) {
      this.getPreReq()
      console.log('updateGuideProperties', this.extra?.preReqs)
      const _conditions = this.getConditions(this.extra?.preReqs)
      this.conditions.patchValue(_conditions)
    }
  }

  updateStepProperties = () => {
    this._steps.patchValue(this.steps[0]?.uid || '')
    this.cdr.markForCheck();
    //this.step = {}
  }
  
  getPreReqFromWidget = () => {
    // get guide condition from widget
    let preReqs = this.extra?.eightyfive?.structure?.steps
    .find((i: any) => i.uid === 'items')
    .action.items
    .find((i: any) => i.apiName === this.extra?.apiName)?.preReqs
    if (preReqs) {
      preReqs = preReqs.map((i: any) => ({ ...i, tags: '[panel]'}))
    }
    console.log('getPreReqFromWidget', preReqs)

    return preReqs || []
  }

  getPreReqFromAutoload = () => {
    // get guide condition from autoload
    let  preReqs = this.extra?.autoload?.structure?.steps
    .filter((i: any) => i.followers?.length === 1 &&
      !['85grcrxsh', 'hotspots'].includes(i.followers[0].nextScenario))
    .find((i: any) => i.followers[0].nextScenario === this.extra?.apiName)?.preReqs
    if (preReqs) {
      preReqs = preReqs.map((i: any) => ({ ...i, tags: '[autoload]'}))
    }
    console.log('getPreReqFromAutoload', preReqs)

    return preReqs || []
  }

  getPreReqFromHotspot = () => {
    // get guide condition from hotspot
    let  preReqs = this.extra?.hotspot?.structure?.steps
    .find((i: any) => i.id === 'hotspot' && i.uid === this.extra?.apiName)?.preReqs

    console.log('getPreReqFromHotspot', preReqs)

    return preReqs || []
  }

  getPreReq = () => {
    this.extra.preReqs = [...this.getPreReqFromWidget(), ...this.getPreReqFromAutoload(), ...this.getPreReqFromHotspot()]
  }

  getConditions = (value: any) => {
    const conditions: string = value
    if (!conditions) {
        return ''
    }

    const guideConditions = new GuideConditions()
    const roles: any[] = []
    const pages: any[] = []
    if (!this.extra?.guides) {
      return []
    }
    guideConditions.setValues(this.extra.guides, roles, pages)

    return guideConditions.getGuideConditions(conditions)
  }

  public getScreenshot(path: string): Observable<any> {
    // /api/edge/app/_vJrBqQVRcevoqF1BZSNVg/screenshot/wr2zb1tlzcd/
    // https://guidedlearning.oracle.com/api/edge/app/h++Fe5P3SVmDr6d_YWJspw/screenshot/pz5il32wez/
    // https://guidedlearning-emea.oracle.com/player/latest/api/app/75FwS47DSwaZctGvMwMmMg/screenshot/6fj0ggm417/
    let url = path
    if (path && !path.startsWith('http')) {
      url = `${this.service.getConfig().url}${path}`;
    }

    url = url.replace('/api/edge/app/', '/player/latest/api/app/')

    return this.http
      .get(url)
      .pipe(catchError((error) => of(error)))
  }

  jobAid = () => {
    // https://guidedlearning-emea.oracle.com/player/latest/api/scenario/export/v1/75FwS47DSwaZctGvMwMmMg/9c21fdck/lang/--/?draft=dev&_=1707662054&windowMode=unpin

    let url = `${this.service.getConfig().url}/player/latest/api/scenario/export/v2/${this.service.getConfig().appId}/${this.extra.apiName}/`;
    if (this.service.getConfig().env) {
      url += '?draft=dev'
    }

    window.open(url)
  }

  copyTitle = () => {
    if (this.extra?.apiName) {
      navigator.clipboard.writeText(this.extra.apiName);
    }
  }

  onClipboardCopy = (successful: boolean): void => {
  }

  __data = () => JSON.stringify({ steps: this._data?.structure?.steps })

  __step = () => JSON.stringify(this.step)

  export = () => this.service.exportGuide(this.extra?.apiName).subscribe(data => { 
    console.log('export', data)
    const json = JSON.stringify(data)
    const blob = new Blob([json], { type: 'text/json;charset=utf-8;' })
    saveAs(blob, `${this.extra?.apiName}-(${this.service.getConfig().appId}).json`)
  })

  simulation = () => {
    // https://guidedlearning-emea.oracle.com/player/latest/api/scenario/export/v1/75FwS47DSwaZctGvMwMmMg/9c21fdck/lang/--/?draft=dev&_=1707662054&windowMode=unpin

    let url = `${this.service.getConfig().url}/player/latest/api/scenario/simulation/try_it/${this.service.getConfig().appId}/${this.extra.apiName}/`;
    if (this.service.getConfig().env) {
      url += '?draft=dev'
    }

    window.open(url)
  }

  video = () => {
    // https://guidedlearning-emea.oracle.com/player/latest/api/scenario/export/v1/75FwS47DSwaZctGvMwMmMg/9c21fdck/lang/--/?draft=dev&_=1707662054&windowMode=unpin

    let url = `${this.service.getConfig().url}/player/latest/api/scenario/simulation/see_it/${this.service.getConfig().appId}/${this.extra.apiName}/`;
    if (this.service.getConfig().env) {
      url += '?draft=dev'
    }

    window.open(url)
  }
}

