import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  //to .env
  private apiUrl = environment.AUTODESK_API_URL;
  private clientId = environment.APS_CLIENT_ID;
  private clientSecret = environment.APS_CLIENT_SECRET;
  private authToken: any | null = null;

  constructor(
    private http: HttpClient
  ) {

  }
  
  
  generateToken(): Observable<any> {
    if (this.authToken) {
      // If the token already exists, return it
      // Not returns all response body, just returns pure token string extracted from json
      /* const pureAuthToken = JSON.parse(this.authToken.body)['access_token'];
      return pureAuthToken; */
      return this.authToken;
    } else {
      // If the token doesn't exist, fetch and return a new token
      return this.getToken();
    }
  }
 
  getTokenData(): any {
    this.generateToken().subscribe(
      (response) => {
        const token = JSON.parse(response.body)['access_token'];
        return token;
      },
      (error) => {
        console.error('Token Error:', error);
      }
    );
  }

  getToken(): Observable<any> {
    const baseUserId = btoa(`${this.clientId}:${this.clientSecret}`);
    const authheader = `Basic ${baseUserId}`;
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: authheader,
    });

    const body = new HttpParams()
      .set('grant_type', 'client_credentials')
      .set(
        'scope',
        'data:read data:write data:create bucket:read bucket:create bucket:delete'
      );

    const options = {
      headers: headers,
      observe: 'response' as 'body',
      responseType: 'text' as 'json',
      withCredentials: true,
    };
    ("HERE4");
    return this.http.post(this.apiUrl, body.toString(), options).pipe(
      map((response: any) => {
        this.authToken = response; // Store the token in the variable
        return this.authToken;
      }),
      catchError((error) => {
        console.error('Token Error:', error);
        throw error;
      })
    );
  }
}