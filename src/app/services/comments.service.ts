import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, model } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
  })
export class CommentsService {
    //to .env
    baseCommentApiUrl: string = environment.BASE_COMMENT_API_URL + "/Model/";
    
    constructor(
        private http: HttpClient,
    ){
        
    }

    createModel(modelURN: string): Observable<any> {
        const headers = new HttpHeaders({
            "Content-Type": "application/json"
            });
        
        const body = {
            "modelURN": modelURN
        }

        const createModelURL = this.baseCommentApiUrl + "create";
        
        return this.http.post(createModelURL, body, { headers });
    }

    addPart(modelUrn: string, partId: string): Observable<any> {
        const headers = new HttpHeaders({
            "Content-Type": "application/json"
            });
        const body = {
            "partId": partId
        }

        const addPartURL = this.baseCommentApiUrl + modelUrn + "/addPart";

        return this.http.post(addPartURL, body, {headers});
    }

    addComment(modelUrn: string, partId: string, commentId: string, comment: string): Observable<any> {
        const headers = new HttpHeaders({
            "Content-Type": "application/json"
            });
        const body = {
            "key": commentId,
            "value": comment
        }


        const addCommentURL = this.baseCommentApiUrl + modelUrn + "/part/" + partId + "/add";

        return this.http.post(addCommentURL, body, {headers});
    }

    removeComment(modelUrn: string, partId: string, commentId: string): Observable<any> {
        const removeCommentURL = this.baseCommentApiUrl + modelUrn + "/part/" + partId + "/remove/" + commentId;

        return this.http.post(removeCommentURL,"");
    }

    getComments(modelURN: string, partId: string): Observable<any> {
        const getCommentURL = this.baseCommentApiUrl + modelURN + "/part/" + partId;
        return this.http.get(getCommentURL);
    }
}