import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { IConfig } from '../app/utils/constants';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private config: IConfig = {
    appId: '',
    url: '',
    env: false, // true = dev
  };

  constructor(private readonly http: HttpClient) {
    console.log('ogl-viewer', 'service', new Date().getTime());
  }

  setConfig = (config: IConfig) => {
    console.log('ogl-viewer', 'setConfig', config);
    this.config = config;
  };

  getConfig = () => this.config;

  getGuides = (params?: string): Observable<any> =>
    this.getApiWithUrl(
      `${this.config.url}/player/latest/api/scenario/list/${this.config.appId}/`,
      params
    );

  getGuide = (apiName: string, params?: any) =>
    this.getApiWithUrl(
      `${this.config.url}/player/latest/api/scenario/get/${this.config.appId}/${apiName}/lang/--/`,
      params
    );

  getAutoload = (params?: any) =>
    this.getApiWithUrl(
      `${this.config.url}/player/latest/api/scenario/get/${this.config.appId}/`,
      params
    );

  getCConfig = (params?: any) => {
    // params = { ...params, host: '*' }
    return this.getApiWithUrl(
      `${this.config.url}/player/latest/api/config/${this.config.appId}/`,
      params)
    }

  exportGuide = (apiName: string, params?: any) =>
    this._getApiWithUrl(
      `${this.config.url}/api/edge/export_guide/${this.config.appId}/${apiName}/`,
        params
    );  
  
  getUrlFromParams = (url: string, params?: any) => {
    let _url = url;
    if (!!this.config.env) {
      params = { ...params, env: 'dev' };
    }
    if (params) {
      _url +=
        `?${ 
        Object.entries(params)
          .map(
            ([key, val]) =>
              `${key}=${encodeURIComponent(val as string | number | boolean)}`
          )
          .join('&')}`;
    }
    
    return _url
  }

  getApiWithUrl = (url: string, params?: any) => {
    const _url = this.getUrlFromParams(url, params)

    return this.http
      .jsonp<any>(_url, 'callback')
      .pipe(catchError(error => of(error)));
  };

  _getApiWithUrl = (url: string, params?: any) => {
    const _url = this.getUrlFromParams(url, params)

    return this.http
      .get<any>(_url)
      .pipe(catchError(error => of(error)));
  };
}
