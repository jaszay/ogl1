import {
  afterNextRender,
  AfterViewInit,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { deepCopyObject } from '../../utils/utils';
import mermaid from 'mermaid';
import * as d3 from 'd3';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { GuideConditions } from '../../utils/conditions';
import { saveAs } from 'file-saver'

window.addEventListener('load', function () {
  var svgs = d3.selectAll(".mermaid svg");
  svgs.each(function () {
    var svg = d3.select(this);
    svg.html("<g>" + svg.html() + "</g>");
    var inner = svg.select("g");
    var zoom = d3.zoom().on("zoom", function (event) {
      inner.attr("transform", event.transform);
    });
    // svg.call(zoom);
  });
});

(window as any)['callback'] = function (id: string) {
  console.log('callback', id);
  window.postMessage({ flow: id }, window.origin)
}

@Component({
  selector: 'step-dialog',
  // eslint-disable-next-line @angular-eslint/component-max-inline-declarations
  template: `<h2 mat-dialog-title>Step {{data.uid}}</h2>
  <mat-dialog-content>
    <div style="display:flex">
      <div style="width: 50%">
        <pre style="overflow-y: scroll; padding: 5px; white-space: pre-wrap;">{{data | json}}</pre>
      </div>
      <div style="display:flex; flex-direction: column; gap: 20px; width: 50%">
        @if (data.stepConditions) {
          <div style="padding: 5px; word-wrap:break-word;">
            <div>Step Conditions</div>
            <div>{{data.stepConditions}}</div>
          </div>
        }
        @if (data.branchConditions) {
          <div style="padding: 5px; word-wrap:break-word;">
            <div>Branch Conditions</div>
            <div>{{data.branchConditions}}</div>
          </div>
        }
        @if (data.advanceConditions) {
          <div style="padding: 5px; word-wrap:break-word;">
            <div>Advance Conditions</div>
            <div>{{data.advanceConditions}}</div>
          </div>
        }
      </div>
    </div>
  </mat-dialog-content>`,
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent
  ]
})
export class StepDialog {
  readonly dialogRef = inject(MatDialogRef<StepDialog>);
  readonly data = inject<any>(MAT_DIALOG_DATA);

  onNoClick(): void {
    this.dialogRef.close();
  }
}

@Component({
  selector: 'app-view',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  templateUrl: './view.component.html',
  styleUrl: './view.component.css',
})
export class ViewComponent implements OnInit, AfterViewInit {
  private destroyRef = inject(DestroyRef);
  readonly dialog = inject(MatDialog);
  @ViewChild('mermaid', { static: true }) mermaid!: ElementRef;
  @Input() set data(value: any) {
    if (Object.keys(value).length) {
      this._data = deepCopyObject(value);
      this.steps = this._data?.structure?.steps || [];
      this.extra = value?.extra;
      delete this._data.extra;

      console.log('guides/view', 'set data', value, this.extra, this.steps);
      this.updateSteps(this.steps);

      this.flow = `graph TD\n`;
      this.getFlow();
      this.renderFlow();

      console.log('flow', this.flow);
    }
  }

  _data: any = {};
  steps: any[] = [];
  step: any = {};
  extra: any = {};

  flow = ``;

  constructor() {
    /*afterNextRender({
      read: () => {
        void mermaid.init()
      }
    })*/

    console.log('constructior')

    window.addEventListener("message", event => {
      if ((event?.data as any)?.hasOwnProperty('flow')) {
        const data = this.steps.find((i: { uid: string; }) => i.uid === event.data.flow)

        delete data['hierarchicalOrder']
        delete data['multiTip']
        delete data['multiFollower']

        delete data.action.coordinates
        delete data.action.screenshot
        delete data.action.roleTexts
        delete data.action.page
        delete data.action.classes
        delete data.action.placement
        delete data.action.markerPlacement
        delete data.action.width
        delete data.action.exposeType
        delete data.action.noExpose
        delete data.action.fixed
        delete data.action.onlyOneTip
        delete data.action.tipAutoFocus

        data.stepConditions = this.getConditions(data.action.conditions)
        data.branchConditions = this.getConditions(data.followers)
        data.advanceConditions = this.getConditions(data.next?.conditions)

        console.log('event', event, event.data.flow, data)
        const dialogRef = this.dialog.open(StepDialog, { data });

        dialogRef.afterClosed().subscribe(result => {
          console.log('The dialog was closed');
        });
      }
    });
  }

  public ngOnInit(): void {
  }

  public ngAfterViewInit(): void {
    mermaid.initialize({
      startOnLoad: true,
      securityLevel: 'loose',
      fontFamily: 'monospace',
      fontSize: 14
    });
  }

  getFlow = () => {
    const ls = this.steps.length;
    this.steps.forEach((step, index, array) => {
      // console.log('getFlow/steps', index, l, step, next)
      if (index < ls - 1) {
        const lf = step?.followers?.length || 0
        const _step = step.id
        const _stepUid = step.uid
        const _stepOrdinal = step.action.stepOrdinal
        const _stepHierarchicalOrdinal = step['hierarchicalOrder']
        const multiTips = this.steps.filter(j => j.id === step.id)
        const content = step.action.contents['#content']
        const branched = content.includes('data-iridize-nextscenario')
        if (branched) {
          // console.log('branched', _stepUid, step.action.contents, content)
          let branches = content.match(/data-iridize-nextscenario="\{(.*)\}"/g)
          branches = branches.map((k: string) =>
            JSON.parse(this.decodeHtml(k.substring(27, k.length - 1))))
          console.log('branches', branches)
          branches.forEach((l: { nextScenario: any; next: any; }) => {
            const externalBranch = this.extra.apiName !== l.nextScenario
            if (!externalBranch) {
              const sn = l.next
              const s = array.find(m => m.id === sn) // first
              console.log('branch', sn, s)
              this.flow += `${_stepUid}[**Step ${_stepHierarchicalOrdinal}**\n\nord: ${_stepOrdinal}\nid: ${_step}\nuid: ${_stepUid}] -.-> | branched | ${s.uid}[**Step ${s['hierarchicalOrdinal']}**\n\nord: ${s.action.stepOrdinal}\nid: ${s.id}\nuid: ${s.uid}]\n`;
            } else {
              // external
              const g = this.extra.guides.find((n: { apiName: string; }) => n.apiName === l.nextScenario)
              if (g) {
                console.log('external', g)
                this.flow += `${_stepUid}[**Step ${_stepHierarchicalOrdinal}**\n\nord: ${_stepOrdinal}\nid: ${_step}\nuid: ${_stepUid}] -.-> | branched | ${l.nextScenario}[**${l.nextScenario}**\n\nord: ${'N/A'}\nid: ${'N/A'}\nuid: ${'N/A'}]:::blue\n`;
                this.flow += `classDef blue fill:blue, color:white\n`
              } else {
                console.log('external, not found', l.nextScenario)
                this.flow += `${_stepUid}[**Step ${_stepHierarchicalOrdinal}**\n\nord: ${_stepOrdinal}\nid: ${_step}\nuid: ${_stepUid}] -.-x | branched | ${l.nextScenario}[**${l.nextScenario}**\n\nord: ${'N/A'}\nid: ${'N/A'}\nuid: ${'N/A'}]\n`;
                this.flow += `style ${l.nextScenario} fill:blue, stroke:red, stroke-width:2px, color:white\n`
              }
            }
          })
        }
        step?.followers?.forEach((follower: any, _index: number, _array: any[]) => {
          // console.log('getFlow/follower', follower)
          const fn = follower.next
          const branched = !!follower.nextScenario
          if (branched) {
            const fns = follower.nextScenario
            const externalBranch = this.extra.apiName !== follower.nextScenario
            if (!externalBranch) {
              const s = array.find(m => m.id === fn) // first
              console.log('branch 2', fn, s)
              this.flow += `${_stepUid}[**Step ${_stepHierarchicalOrdinal}**\n\nord: ${_stepOrdinal}\nid: ${_step}\nuid: ${_stepUid}] -.-> | branched | ${s.uid}[**Step ${s['hierarchicalOrdinal']}**\n\nord: ${s.action.stepOrdinal}\nid: ${s.id}\nuid: ${s.uid}]\n`;
            } else {
              // external
              const g = this.extra.guides.find((n: { apiName: string; }) => n.apiName === fns)
              if (g) {
                console.log('external 2', g)
                this.flow += `${_stepUid}[**Step ${_stepHierarchicalOrdinal}**\n\nord: ${_stepOrdinal}\nid: ${_step}\nuid: ${_stepUid}] -.-> | branched | ${fns}[**${fns}**\n\nord: ${'N/A'}\nid: ${'N/A'}\nuid: ${'N/A'}]:::blue\n`;
                this.flow += `classDef blue fill:blue, color:white\n`
              } else {
                console.log('external 2, not found', fns)
                this.flow += `${_stepUid}[**Step ${_stepHierarchicalOrdinal}**\n\nord: ${_stepOrdinal}\nid: ${_step}\nuid: ${_stepUid}] -.-x | branched | ${fns}[**${fns}**\n\nord: ${'N/A'}\nid: ${'N/A'}\nuid: ${'N/A'}]\n`;
                this.flow += `style ${fns} fill:blue, stroke:red, stroke-width:2px, color:white\n`
              }
            }
          } else {
            const _next = array.find(i => i.id === fn)
            if (_next) {
              const _nextUid = _next.uid
              const _followerOrdinal = _next.action.stepOrdinal
              const _followerHierarchicalOrdinal = _next['hierarchicalOrder']
              const lnf = _next.followers?.length || 0
              const __next = follower.condition === "true" // normal flow
              const __nextIndex = _array.findIndex(i => i.condition === "true")
              const arrow = __nextIndex >= _index ? '-->' : '-.->'
              const label = (__nextIndex !== _index && _array.length > 1) ? '| branched |' : ''

              if (fn !== 'eol0') {
                this.flow += `${_stepUid}[**Step ${_stepHierarchicalOrdinal}**\n\nord: ${_stepOrdinal}\nid: ${_step}\nuid: ${_stepUid}] ${arrow} ${label} ${_nextUid}[**Step ${_followerHierarchicalOrdinal}**\n\nord: ${_followerOrdinal}\nid: ${fn}\nuid: ${_nextUid}]\n`;
              }
              if (fn === 'eol0') {
                this.flow += `${_stepUid}[**Step ${_stepHierarchicalOrdinal}**\n\nord: ${_stepOrdinal}\nid: ${_step}\nuid: ${_stepUid}] ${arrow} ${label} ${_nextUid}[**Step ${_followerHierarchicalOrdinal}**\n\nord: ${_followerOrdinal}\nid: ${fn}\nuid: ${_nextUid}]:::red\n`;
                this.flow += `classDef red fill:#f00, color:white\n`
              }
              // this.flow += `click ${_stepUid} call callback(${_stepUid})\n` // does not work
              this.flow += `click ${_stepUid} href "javascript:callback('${_stepUid}');"\n`
              // this.flow += `click ${_stepUid} href "javascript:callback(${step});"\n` \\ [Object]
              // this.flow += `click ${_stepUid} href "javascript:callback(${JSON.stringify(step)});"\n` // Maximum text size in diagram exceeded
            } else {
              // points to non-exist step
            }
          }
        })
      }
    })
  }

  renderFlow = () => {
    const element: any = this.mermaid.nativeElement;
    console.log('mermaid', JSON.stringify(this.flow));
    mermaid.render('graphDiv', this.flow).then(({ svg, bindFunctions }) => {
      element.innerHTML = svg;
      bindFunctions?.(element);
    });
  };

  // eslint-disable-next-line class-methods-use-this
  updateSteps = (steps: any[]) => {
    let mainLevel = 1;
    let subLevel = 0;
    steps.forEach((i, index, array) => {
      if (index > 0) {
        if (i.id !== array[index - 1].id) {
          mainLevel += 1;
          subLevel = 0;
        } else {
          subLevel += 1;
        }
      }
      i['hierarchicalOrder'] = `${mainLevel}${subLevel > 0 ? `.${subLevel}` : ''
        }`;
      i['multiTip'] = !!(array.filter((j) => j.id === i.id)?.length > 1);
      i['multiFollower'] = !!(i.followers?.length > 1);
    });
  };

  downloadFlow = () => {
    const createStyleElementFromCSS = () => {
      // JSFiddle's custom CSS is defined in the second stylesheet file
      const sheet = document.styleSheets[1];

      const styleRules = [];
      for (let i = 0; i < sheet.cssRules.length; i++)
        styleRules.push(sheet.cssRules.item(i)!.cssText);

      const style = document.createElement('style');
      style.type = 'text/css';
      style.appendChild(document.createTextNode(styleRules.join(' ')))

      return style;
    };
    //const style = createStyleElementFromCSS();

    const download = () => {
      // fetch SVG-rendered image as a blob object
      const svg = document.querySelector('.mermaid')!;
      //svg.insertBefore(style, svg.firstChild); // CSS must be explicitly embedded
      const data = (new XMLSerializer()).serializeToString(svg);
      const svgBlob = new Blob([data], {
        type: 'image/svg+xml;charset=utf-8'
      });
      //style.remove(); // remove temporarily injected CSS

      // convert the blob object to a dedicated URL
      const url = URL.createObjectURL(svgBlob);

      // load the SVG blob to a flesh image object
      const img = new Image();
      img.addEventListener('load', () => {
        // draw the image on an ad-hoc canvas
        const bbox = (svg as any).getBBox();

        const canvas = document.createElement('canvas');
        canvas.width = bbox.width;
        canvas.height = bbox.height;

        const context = canvas.getContext('2d')!;
        context.drawImage(img, 0, 0, bbox.width, bbox.height);

        URL.revokeObjectURL(url);

        // trigger a synthetic download operation with a temporary link
        const a = document.createElement('a');
        a.download = 'image.png';
        document.body.appendChild(a);
        a.href = canvas.toDataURL();
        a.click();
        a.remove();
      });
      img.src = url;
    };

    function copyStylesInline(destinationNode: any, sourceNode: any) {
      var containerElements = ["svg", "g"];
      for (var cd = 0; cd < destinationNode.childNodes.length; cd++) {
        var child = destinationNode.childNodes[cd];
        if (containerElements.indexOf(child.tagName) != -1) {
          copyStylesInline(child, sourceNode.childNodes[cd]);
          continue;
        }
        var style = sourceNode.childNodes[cd].currentStyle || window.getComputedStyle(sourceNode.childNodes[cd]);
        if (style == "undefined" || style == null) continue;
        for (var st = 0; st < style.length; st++) {
          child.style.setProperty(style[st], style.getPropertyValue(style[st]));
        }
      }
    }

    function downloadSvg(svg: any, fileName: string) {
      var copy = svg.cloneNode(true);
      copyStylesInline(copy, svg);
      var canvas = document.createElement("canvas");
      var bbox = svg.getBBox();
      canvas.width = bbox.width;
      canvas.height = bbox.height;
      var ctx = canvas.getContext("2d")!;
      ctx.clearRect(0, 0, bbox.width, bbox.height);
      //var data = (new XMLSerializer()).serializeToString(copy);
      //var svgBlob = new Blob([data], {type: "image/svg+xml;charset=utf-8"});
      //saveAs(svgBlob, fileName) 
      canvas.toBlob(function (blob) {
        saveAs(blob as Blob, "pretty image.png");
      });
    };

    // const _svg = document.querySelector('.mermaid svg')
    // downloadSvg(_svg, 'mermaid.png')

    function downloadImg() {
      const svgElem = document.querySelector('.mermaid svg')!
      const serializer = new XMLSerializer();
      let svgData = serializer.serializeToString(svgElem);
      svgData = `<?xml version="1.0" standalone="no"?>\r\n${svgData}`;
      const svgBlob = new Blob([svgData], {
        type: 'image/svg+xml;charset=utf-8'
      });
      let DOMURL = window.URL || window.webkitURL || window;
      const url = DOMURL.createObjectURL(svgBlob);

      const img = new Image();
      img.setAttribute('crossorigin', 'anonymous');
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        const domRect = (svgElem as any).getBBox();
        canvas.width = domRect.width;
        canvas.height = domRect.height;
        ctx.drawImage(img, 0, 0, domRect.width, domRect.height);
        DOMURL.revokeObjectURL(url);

        /*const imgURI = canvas
          .toDataURL('image/png')
          .replace('image/png', 'image/octet-stream');
    
        _download(imgURI);*/
        canvas.toBlob(function (blob) {
          saveAs(blob as Blob, "pretty image.png");
        });
      };
      img.onerror = e => {
        console.error('Image not loaded', e);
      };

      img.src = url;
    }

    function _download(href: string) {
      let download = document.createElement('a');
      download.href = href;
      download.download = 'img.png';
      download.click();
      download.remove();
    }

    downloadImg()

  }

  decodeHtml = (html: string) => {
    let areaElement = document.createElement("textarea");
    areaElement.innerHTML = html;
    let z = areaElement.value;
    areaElement.remove();

    return z;
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
}
