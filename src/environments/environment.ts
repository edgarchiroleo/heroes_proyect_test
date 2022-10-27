import { auth } from '../app/conf/auth_conf'

export const environment = {
  production: false,
  domain: auth.domain,
  clientId: auth.clientId,
  redirectUri: window.location.origin
};

