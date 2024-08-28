export class BucketBody {
    'bucketKey': string;
    'policyKey': string;
  }
  
  export class UploadKey{
    'uploadKey':string
  }
  export class ExportJob {
    input: {
      urn: string;
    };
    output: {
      formats: {
        type: string;
        views: string[];
      }[];
    };
  
    constructor() {
      this.input = {
        urn: "dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6dGVzdGJ1Y2tldDEyM2FuZ3VsYXIvcmFjYmFzaWNzYW1wbGVwcm9qZWN0dGVzdC5ydnQ="
      };
  
      this.output = {
        formats: [
          {
            type: "svf2",
            views: ["2d", "3d"]
          }
        ]
      };
    }
  }