import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, catchError, lastValueFrom, map, of, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth-service.service';
import { SignedUrlResponse } from '../interfaces';
import { ExportJob } from '../models/models';


@Injectable({
  providedIn: 'root'
})
export class ModelsService {
  //to .env
  client_ID = environment.APS_CLIENT_ID.toLowerCase();
  baseUrl: string = environment.AUTODESK_API_URL_BASE; 
  bucketName: string = environment.EXISTING_BUCKET_NAME;
  bucketItem: string = `/oss/v2/buckets/${this.bucketName}/objects`;
  bucket: any = '/oss/v2/buckets';
  baseCommentApiUrl: string = environment.BASE_COMMENT_API_URL;
  
  authToken: any = "";
  token: any;
  resp: any;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { 
  }
  
  

  getObtainSignedUrl(objectName: string, lifespanURL: string): any {
    this.getToken();
    var response:any = this.getToken();
    const tempToken = JSON.parse(response.body)['access_token'];


    const authheader = `Bearer ${tempToken}`;
    const headers = new HttpHeaders({
      "Authorization": `${authheader}`,
      "Content-Type": "application/json"
    });

    const getObtainSignedUrl = this.baseUrl + this.bucketItem + "/" + objectName + "/signeds3upload?minutesExpiration=" + lifespanURL;
    
    return this.http.get<SignedUrlResponse>(getObtainSignedUrl, { headers });
  }

  /* curl -X PUT \
    '<SIGNED_UPLOAD_URL>'\
    --data-binary '@<PATH_TO_YOUR_FILE_TO_UPLOAD>' */

  uploadFileWithSignedUrl(signedUrl: string, file: File): any {

    const headers = new HttpHeaders({
      'Content-Type': file.type
    });

    return this.http.put(signedUrl, file, { headers, responseType: 'text' });
  }

  finalizeUpload(objectKey: string, uploadKey: string): any {
    this.getToken();
    var response:any = this.getToken();
    const tempToken = JSON.parse(response.body)['access_token'];
    
    
    const authheader = `Bearer ${tempToken}`;
    const headers = new HttpHeaders({
      "Authorization": `${authheader}`,
      "Content-Type": "application/json"
    });
    const body = {
      ossbucketKey: this.bucketName,
      ossSourceFileObjectKey: objectKey,
      access: "full",
      uploadKey: uploadKey
    };

    const postReqUrl = this.baseUrl + `/oss/v2/buckets/${this.bucketName}/objects/${objectKey}/signeds3upload`;

    return this.http.post(postReqUrl, body, { headers });
  } 
  
  startTranslationOfFile(urn: string): any {
    this.getToken();
    var response:any = this.getToken();
    const tempToken = JSON.parse(response.body)['access_token'];
    
    const authheader = `Bearer ${tempToken}`;
    const headers = new HttpHeaders({
      "Authorization": `${authheader}`,
      'x-ads-force': 'true',
    });
    const body = new ExportJob();
    body.input.urn = urn;
    return this.http.post(
      this.baseUrl + '/modelderivative/v2/designdata/job',
      body,
      { headers: headers }
    );
  }
  checkManifest(urn: string): any {
    this.getToken();
    var response:any = this.getToken();
    const tempToken = JSON.parse(response.body)['access_token'];
    
    
    const authheader = `Bearer ${tempToken}`;
    const headers = new HttpHeaders({
      "Authorization": `${authheader}`
    });
    return this.http.get(
      this.baseUrl + `/modelderivative/v2/designdata/${urn}/manifest`,
      { headers: headers }
    );
  }






  getToken(): any {
    return this.authService.generateToken();
  }

  GetBucketData(): Observable<any> {
    const authheader = `Bearer ${this.token}`;
    const headers = new HttpHeaders({
      Authorization: `${authheader}`,
    });

    return this.http.get<any>(this.baseUrl + this.bucket, { headers });
  }
  
  getModels(): Observable<any> {
    this.getToken();
    var response:any = this.getToken();
    const tempToken = JSON.parse(response.body)['access_token'];
    
    
    const authheader = `Bearer ${tempToken}`;
    const headers = new HttpHeaders({
      "Authorization": `${authheader}`,
      "Content-Type": "application/json"
    });


    const getReqUrl = this.baseUrl + `/oss/v2/buckets/${this.bucketName}/objects`;

    return this.http.get(getReqUrl, { headers });
  }


  CreateBucket(token: any, body: any): Observable<any> {
    const authheader = `Bearer ${token}`;
    const headers = new HttpHeaders({
      Authorization: `${authheader}`,
    });
    return this.http.post(this.baseUrl + '/oss/v2/buckets', body, {
      headers: headers,
    });
  }

  DeleteBucket(token:any,bucketName:string): Observable<any>{
    const authheader = `Bearer ${token}`;
    const headers = new HttpHeaders({
      Authorization: `${authheader}`,
    });
    return this.http.delete(this.baseUrl +`/oss/v2/buckets/${bucketName}`,{headers:headers});
  }

}
