export const AUTH_CONFIG = {
  clientID: process.env.AUTH0_CLIENTID,
  domain: process.env.AUTH0_DOMAIN,
  redirectUri: process.env.AUTH0_REDIRECTURI,
  audience: process.env.AUTH0_AUDIENCE,
  apiUrl: 'API_IDENTIFIER',
  responseType: 'token id_token',
  scope: 'openid profile email email_verified'
}
