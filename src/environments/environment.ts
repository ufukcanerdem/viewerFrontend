// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  APS_CLIENT_ID: "<Your-Client-Id-Here>",
  APS_CLIENT_SECRET: "<Your-Client-Secret-Here>",
  EXISTING_BUCKET_NAME: "<Your-Bucket-Name-Here>",  //You need the create a bucket manually with token and enter here
  BASE_COMMENT_API_URL: "<Your-Viewer-Backend-Api-Url-Here>", //Example: "http://localhost:5252/api"
  AUTODESK_API_URL: "https://developer.api.autodesk.com/authentication/v2/token",
  AUTODESK_API_URL_BASE: "https://developer.api.autodesk.com",

};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
