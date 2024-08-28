    export interface ModelResponseItem {
        bucketKey: string;
        objectKey: string;
        objectId: string;
        sha1: string;
        size: number;
        location: string;
    }

    export interface ModelDetail {
        urn: string;
        name: string;
    }

    export interface SignedUrlResponse {
        uploadKey: string;
        uploadExpiration: string;
        urlExpiration: string;
        urls: string[];
        location: string;
    }

    export interface Permission {
        authId: string;
        access: string;
    }
      
    export interface FinalizeUploadResponse {
        bucketKey: string;
        objectId: string;
        objectKey: string;
        size: string;
        contentType: string;
        location: string;
        permissions: Permission[];
        policyKey: string;
    }

    export interface AcceptedJob {
        output: {
          formats: {
            type: string;
            views: string[];
          }[];
        };
      }
      
      export interface TranslatedFile {
        result: string;
        urn: string;
        acceptedJobs: AcceptedJob;
      }

      export interface ManifestResponse {
        type: string;
        hasThumbnail: string;
        status: string;
        progress: string;
        region: string;
        urn: string;
        version: string;
        derivatives: any[];
      }

