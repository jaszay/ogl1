export const tenancies = [
  {
    id: 'namer',
    name: 'NAMER',
    url: 'https://guidedlearning.oracle.com',
  },
  {
    id: 'emea',
    name: 'EMEA',
    url: 'https://guidedlearning-emea.oracle.com',
  },
  {
    id: 'apac',
    name: 'APAC',
    url: 'https://guidedlearning-apac.oracle.com',
  },
  {
    id: 'namer-uat',
    name: 'NAMER UAT',
    url: 'https://guidedlearning-uat.oracle.com',
  },
  {
    id: 'emea-uat',
    name: 'EMEA UAT',
    url: 'https://guidedlearning-emea-uat.oracle.com',
  },
  {
    id: 'apac-uat',
    name: 'APAC UAT',
    url: 'https://guidedlearning-apac-uat.oracle.com',
  },
  {
    id: 'oc4',
    name: 'OC4',
    url: 'https://prod.oc4.guidedlearning.ocs.oraclegovcloud.uk'
  },
    {
    id: 'oc29',
    name: 'OC29',
    url: 'https://prod.oc29.guidedlearning.ocs.oraclecloud29.com'
  },
  {
    id: 'local',
    name: 'LOCAL',
    url: 'https://localhost:8443',
  },
  {
    id: 'dev',
    name: 'DEV',
    url: 'https://guidedlearning-dev.oraclecorp.com',
  },
  {
    id: 'medium',
    name: 'MEDIUM',
    url: 'https://guidedlearning-medium.oraclecorp.com',
  },
  {
    id: 'minor',
    name: 'MINOR',
    url: 'https://guidedlearning-minor.oraclecorp.com'
  },
  {
    id: 'ogl2',
    name: 'OGL-2',
    url: 'https://guidedlearning-ogl-2.oraclecorp.com'
  }
];

export interface IConfig {
  appId: string;
  url: string;
  env: boolean;
}
