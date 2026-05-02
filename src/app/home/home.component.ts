import { CommonModule, JsonPipe } from '@angular/common';
import { Component, ViewChild, inject, DestroyRef, ɵɵdeferEnableTimerScheduling } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  ReplaySubject,
  filter,
  forkJoin,
  map,
  pairwise,
  startWith,
} from 'rxjs';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatRadioModule } from '@angular/material/radio';
import { EightyfiveComponent } from '../components/eightyfive/eightyfive.component';
import { GuideComponent } from '../components/guide/guide.component';
import { AutoloadComponent } from '../components/autoload/autoload.component';
import { HotspotComponent } from '../components/hotspot/hotspot.component';
import { ConfigComponent } from '../components/config/config.component';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '../../services/api.service';
import { IConfig, tenancies } from '../utils/constants';
import { filterGuides } from '../utils/filter';
import { ViewComponent } from '../components/view/view.component';

// import { htmlToPptxText } from 'html2pptxgenjs';
// const html2pptxgenjs = require('html2pptxgenjs');

interface IGuide {
  apiName: string;
  displayName: string;
}

declare global {
  interface Window {
    // iridize(api: string, params: object): boolean
    iridize: any;
  }
}

@Component({
  selector: 'app-hone',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    NgxMatSelectSearchModule,
    MatGridListModule,
    MatTabsModule,
    MatSlideToggleModule,
    MatExpansionModule,
    MatRadioModule,
    EightyfiveComponent,
    GuideComponent,
    AutoloadComponent,
    HotspotComponent,
    ConfigComponent,
    MatButtonModule,
    ViewComponent
  ],
})
export class HomeComponent {
  _tenancies = tenancies
  guides: any = ''; // IGuide[] = []

  public filteredGuides: ReplaySubject<any /*IGuide[]*/> =
    new ReplaySubject<any /*IGuide[]*/>(1);

  form = new FormGroup({
    appId: new FormControl('', Validators.required),
    tenancy: new FormControl(''),
    guides: new FormControl(''),
    guideFilterCtrl: new FormControl(''),
    env: new FormControl(true)
  });

  config: IConfig = {
    appId: '',
    url: '',
    env: true, // true = dev
  };

  @ViewChild('singleSelect', { static: true }) singleSelect!: MatSelect;

  private destroyRef = inject(DestroyRef);

  guide: any = {};
  autoload: any = {};
  eightyfivegrcrxsh: any = {};
  hotspot: any = {};
  cconfig: any = {}

  constructor(private _snackBar: MatSnackBar, private service: ApiService) {
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
        console.log('home.guide', value)
      });
  }

  ngOnInit(): void {
    this.form
      .valueChanges
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        startWith(this.form.value),
        pairwise()
      )
      .subscribe(([prev, next]: [any, any]) => {
        console.log('ogl-viewer', 'this.form', prev, next);
        if (prev?.guideFilterCtrl === next.guideFilterCtrl) {
          // not searching
          if (prev.tenancy !== next.tenancy) {
            const tenancy = next.tenancy
            console.log('ogl-viewer', 'tenancy', tenancy);
            // @ts-ignore
            this.config.url = this._tenancies.find((i) => i.id === tenancy)?.url!;
            this.updateData();
          } else if (prev?.env !== next.env) {
            const env = next.env
            console.log('ogl-viewer', 'env', env);
            this.config.env = env
            this.updateData();
          } else if (prev?.appId !== next.appId) {
            const appId = next.appId
            console.log('ogl-viewer', 'appId', appId);
            if (appId) {
              this.config.appId = appId
              this.updateData();
            }
          } else if (prev?.guides !== next.guides) {
            const guide = next.guides
            console.log('ogl-viewer', 'guide', guide);
            this._getGuide(guide);
          }
        }
      });

    this.autoFill();
  }

  _getGuide = (i: any) => {
    // @ts-ignore
    this.service.getGuide(i!)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        filter((j) => !!j)
      )
      .subscribe((k) => {
        if (k.success) {
          console.log('ogl-viewer', '_getGuide', k);
          this.guide = k.data;
          this.guide.extra = {
            apiName: i,
            guides: this.guides,
            eightyfive: this.eightyfivegrcrxsh,
            autoload: this.autoload,
          };
        } else if (k.error) {

          this.showSnackBar(k.errormsg);
          this.guide = k;
        }
      });
  };

  _getGuides = () => {
    this.service.getGuides().subscribe((i) => {
      if (i.success) {
        this.guides = i.data.guides
        // sort
        this.guides = this.guides?.sort((a: any, b: any) => a?.displayName?.toLowerCase() > b?.displayName?.toLowerCase() ? 1 : -1)
        console.log('ogl-viewer', '_getGuides', this.guides)
        this.filteredGuides.next(this.guides.slice())
      } else if (i.error) {

        this.showSnackBar(i.errormsg)
        this.guides = []
      }
    });
  };

  getGuidesAdditional = () => {
    forkJoin([
      this.service.getGuide('85grcrxsh'),
      this.service.getAutoload(),
      this.service.getGuide('hotspots'),
      this.service.getCConfig()
    ])
    .pipe(
      map(([r85grcrxsh, rautoload, rhotspot, rconfig]) => ({r85grcrxsh, rautoload, rhotspot, rconfig}))
    )
    .subscribe(({r85grcrxsh, rautoload, rhotspot, rconfig}) => {
      console.log('ogl-viewer', 'fork', r85grcrxsh, rautoload, rhotspot, rconfig);
      this.autoload = rautoload.data;
      this.eightyfivegrcrxsh = r85grcrxsh.data;
      this.hotspot = rhotspot.data;
      this.cconfig = rconfig;
    });
  };

  resetConfig = () => this.config = { url: '', appId: '', env: false };

  updateData = () => {
    console.log('updateData')
    this.service.setConfig({ 
      appId: this.form.controls.appId.value!, 
      env: this.form.controls.env.value!, 
      url: this._tenancies.find((i) => i.id === this.form.controls.tenancy.value)?.url! 
    })

    if (this.config.url) {
      this._getGuides();
      this.getGuidesAdditional();

      if (this.form.controls.guides.value) {
        this._getGuide(this.form.controls.guides.value);
      }
    }
  };

  protected autoFill() {
    // this.form.controls.appId.patchValue('_vJrBqQVRcevoqF1BZSNVg');
    this.form.controls.appId.patchValue('DN5rHfSdTgCaTOil8GaBTw');
    this.form.controls.tenancy.patchValue('namer');
    this.form.controls.env.patchValue(true);
    // setTimeout(() => this.form.controls.guides.patchValue('w0sfn1ih'), 500);
    setTimeout(() => this.form.controls.guides.patchValue('d8pi5wyu'), 500);
  }

  clean = () => {
    if (window.iridize) {
      // window.iridize('api.guide.stop');
      if (window.iridize.$) {
        window.iridize.$('.sttip').remove();
        window.iridize.$('#content_list').remove();
        window.iridize.$('.ou-convergence-launcher').remove();
        window.iridize.$('.ogl-rw-convergence-launcher').remove();
        window.iridize.$('script[src*="/player/latest/static/js/stBase"').remove();
        window.iridize.$('script[src*="/player/latest/static/js/iridizeLoader"').remove();
        //window.iridize.$('script[src*="/player/latest/static/css/stTip"').remove();
        //window.iridize.$('script[src*=`/player/latest/api/app/${this.appId}/theme`').remove();
        window.iridize.$('.stCssLinks').remove();
      }
      //@ts-ignore
      delete window.iridize;
      //@ts-ignore
      delete window.IridizeLogging;
      delete (window as any).iridizeLoaderStarted;
      delete (window as any).iridizeCall;
      delete (window as any).iridizeDOMPurify;
      delete (window as any).iridizeEmbedCodeWrapper;
      delete (window as any).iridizePostMessenger;
      delete (window as any).iridizeV3Ajax;
    }
  };

  loadWidget = () => {
    this.clean();

    window.iridize =
      window.iridize ||
      //@ts-ignore
      function (e, t, n) {
        //@ts-ignore
        return iridize.api.call(e, t, n);
      };
    //@ts-ignore
    iridize.api = iridize.api || {
      q: [],
      //@ts-ignore
      call(e, t, n) {
        //@ts-ignore
        iridize.api.q.push({ method: e, data: t, callback: n });
      },
    };
    //@ts-ignore
    iridize.appId = this.config.appId;
    //iridize.min = ''
    //@ts-ignore
    iridize.env = !this.config.env ? '' : 'dev';
    //@ts-ignore
    iridize('api.fields.set', { user_id: 'dummy', user_role: 'test' })
    //@ts-ignore
    iridize.debugMode = 'trace'
    //@ts-ignore
    iridize.showStartPanel = true
    //@ts-ignore
    iridize.ignoreCloudConfig = true

    const e = document.createElement('script');
    const t = document.body;
    e.src = `${this.config.url}/player/latest/static/js/iridizeLoader.js`;
    e.type = 'text/javascript';
    e.async = true;
    t.appendChild(e);

    e.onload = () => {
      // Code to execute after the script has loaded
      console.log('Script loaded!');
      // window.iridize("api.guide.start", { "apiName": "85grcrxsh" });
    };
  };

  loadState = () => {
    const state = window.iridize.api.getScenarioState()
    const useSessionStorage = !!(window.iridize.useSessionStorage && window.sessionStorage) || false;
    const storage = window.iridize.util.getCookie('stStorage', useSessionStorage) || {}
  }

  showSnackBar = (message: string) => {
    this._snackBar.open(message, '', {
      horizontalPosition: 'end',
      verticalPosition: 'top',
      duration: 1000,
    });
  };

  reload = () => this.updateData()

  start = () => {
    window.iridize('api.guide.start', { apiName: this.guide?.extra?.apiName })
  }
}
