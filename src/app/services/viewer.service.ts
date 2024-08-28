/// <reference types="forge-viewer" />
import { Injectable, input, model } from '@angular/core';
import { AuthService } from './auth-service.service';
import { lastValueFrom, Observable } from 'rxjs';
import { Keyboard } from "@capacitor/keyboard";
import { CommentsService } from './comments.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root',
})
export class ViewerService {
  authToken: any | null = null;

  constructor(
    private authService: AuthService,
    private commentsService: CommentsService
  ) {
  }



  async initToken() {
   ("Loading Token");
    this.authToken = this.authService.generateToken().subscribe(
      (response) => {
        this.authToken = JSON.parse(response.body)['access_token'];
      },
      (error) => {
        console.error('Token Error:', error);
      }
    );
  }

 
  getToken2(): any {
    return this.authService.generateToken();
  }


  getAccessToken = (callback: (token:any, expiresIn: number) => void) => {
    const access_token = this.authToken;
    const expires_in = 3599;
    callback(access_token, expires_in);
  }

  //arrow functions vs traditional functrions??
  //promise-observable farkı
  //lastvaluefrom??
  
  initViewer = async (container: HTMLElement) =>{
    var response:any = await lastValueFrom(this.getToken2());
      this.authToken = JSON.parse(response.body)['access_token'];
    
      if(response.status < 200 || response.status > 300)
      console.error('Token Error:', response);
    return new Promise((resolve, reject) => {
      Autodesk.Viewing.Initializer({ env: 'AutodeskProduction', getAccessToken: this.getAccessToken }, () => {
        const config = {
          extensions: ['Autodesk.DocumentBrowser'],
        };
        const viewer = new Autodesk.Viewing.GuiViewer3D(container, config);
        viewer.start();
        viewer.setTheme('light-theme');
        viewer.resize();
        resolve(viewer);
      });
    });
  }
  
  addPartToModel(modelURN: string, partId: string): Observable<any> {
    return this.commentsService.addPart(modelURN, partId);
  }

  addCommentToPart(modelURN: string, partId: string, commentId: string, comment: string): Observable<any> {
    return this.commentsService.addComment(modelURN, partId, commentId, comment);
  }

  removeCommentFromPart(modelURN: string, partId: string, commentId: string): Observable<any> {
    return this.commentsService.removeComment(modelURN, partId, commentId);
  }

  getCommentsFromPart(modelURN: string, partId: string): Observable<any> {
    return this.commentsService.getComments(modelURN, partId);
  }

  loadModel(viewer: any, urn: string) {

    const addCommentToAPI = async (modelUrn: string, partId: string, commentId: string, comment: string) => { 
      try {
        const response = await lastValueFrom(this.addCommentToPart(modelUrn, partId, commentId, comment));
      } catch (error) {
        console.error('Error in commentsServiceAfterAddComment:', error);
      }
    }

    const removeCommentFromAPI = async (modelUrn: string, partId: string, commentId: string) => { 
      try {
        const response = await lastValueFrom(this.removeCommentFromPart(modelUrn, partId, commentId));
      } catch (error) {
        console.error('Error in commentsServiceAfterRemoveComment:', error);
      }
    }

    const getCommentsFromAPI = async (modelUrn: string, partId: string): Promise<any> => { 
      try {
        const response = await lastValueFrom(this.getCommentsFromPart(modelUrn, partId));
        const tempItems: Map<string, string> = new Map<string, string>();
        Object.entries(response as { [key: string]: string }).forEach(([key, value]) => {
          tempItems.set(key, value);
        });
        return tempItems;
      } catch (error) {
        console.error('Error in commentsServiceAfterGetComment:', error);
      }
    }

    //Add selected Parts
    //MAY PUT THIS INTO OTHER SAME EVENT LISTENER TO MORE STRICT REQUESTS
    viewer.addEventListener(Autodesk.Viewing.SELECTION_CHANGED_EVENT, (event: any) => {
      const dbIdArray = event.dbIdArray;
      if (dbIdArray.length > 0) {
          const dbId = dbIdArray[0];
          viewer.getProperties(dbId, (props: any) => {
            const response = lastValueFrom(this.addPartToModel(urn, String(props.dbId)));
          });
      }
    });

    return new Promise((resolve, reject) => {

        function onDocumentLoadSuccess(doc: any) {
            const defaultGeometry = doc.getRoot().getDefaultGeometry();
            const model = viewer.loadDocumentNode(doc, defaultGeometry);
            
            viewer.setProgressiveRendering(true);
            //viewer.setLargeModelExperience(true);

            //viewer.setQualityLevel(false, false);
            viewer.setGroundShadow(false);
            viewer.setGroundReflection(false);


            viewer.prefs.set("ambientShadows", false);  //closes ambient shadows for performance improvement

            viewer.impl.setFPSTargets(100,500,1000); // min, target, max !!!this part makes the magic!!!Sets TARGET FPS, ADJUSTS RENDERING TO ACHIEVE THIS FPS VALUES

              //Event listener for selection change
              //It will connect to our api, will get and list data about that part
              //Can make calls like this /urn/part-name/info
            viewer.addEventListener(Autodesk.Viewing.SELECTION_CHANGED_EVENT, (event: any) => {
              const dbIdArray = event.dbIdArray;
              if (dbIdArray.length > 0) {
                  const dbId = dbIdArray[0];
                  viewer.getProperties(dbId, (props: any) => {
                      const infoDiv = document.getElementById("part-info");
                      const infoDivCloseButton = document.getElementById("part-info-close-button");
                      const nameParagraph = document.getElementById("part-name");
                      const comments = document.getElementById("comments");
                      const addButton = document.getElementById("add-Button");
                      
                      if (infoDiv && nameParagraph) {
                          nameParagraph.innerText = `Part Name: ${props.name}`;

                          if(infoDivCloseButton) {
                            infoDivCloseButton.addEventListener('click', () => { 
                              infoDiv.style.display = "none";
                            })
                          }
                          
                          if(comments) {
                            comments.innerHTML = "";
                          }
                          if(addButton) {
                            addButton.innerHTML = "";
                          }

                          const getInput = document.createElement("div");
                          getInput.style.width = "100%";

                          const createButton = document.createElement("button");
                          createButton.textContent = "+";
                          createButton.style.fontSize = "15px";
                          createButton.style.width = "20px";
                          createButton.style.height = "20px";
                          createButton.style.borderRadius = "50px";
                          createButton.style.marginRight = "5px";

                          const inputField = document.createElement("input");
                          inputField.style.color = "white";
                          inputField.placeholder = "Add comment";
                          inputField.style.borderRadius = "5px";
                          inputField.style.width="70%";

                          getInput.appendChild(createButton);
                          getInput.appendChild(inputField);
                          
                          if(addButton) {
                            addButton.appendChild(getInput);
                          }
                          
                          //Add list items to comments div
                          const showComments = async () => { 
                            if(comments) {
                              comments.innerHTML = "";
                              newItems.forEach((value: string, key: string) => {
                                const listItem = document.createElement('li');
                                listItem.style.marginRight = "5%";
                                listItem.style.marginBottom = "5%"
                                listItem.id = key;
                                
                                //Create a text node for the item
                                const textNode = document.createTextNode(value);
                                
                                //Create the "X" button
                                const deleteButtonDiv = document.createElement('div');
                                const deleteButton = document.createElement('button');
                                deleteButton.textContent = 'X';
                                deleteButton.style.width = "15px";
                                deleteButton.style.height = "15px";
                                deleteButton.style.borderRadius = "50px";
                                deleteButton.style.backgroundColor = "red";
                                deleteButton.style.marginRight = "5px";
                                deleteButtonDiv.style.display = "flex";
                                deleteButtonDiv.style.alignItems = "center";
                                deleteButtonDiv.style.justifyContent = "center";
                              
                                //Add click event to the "X" button
                                deleteButton.addEventListener('click', () => {
                                  const userConfirmed = confirm('Are you sure you want to delete this item?');
                                  if (userConfirmed) {
                                    listItem.remove(); // Remove the list item when the user confirms
                                    commentBox.remove();
                                    newItems.delete(listItem.id); //Delete with key
                                    
                                    removeCommentFromAPI(urn, String(dbId), listItem.id); //Delete with key
                                    showComments();
                                  }
                                });
                              
                                const commentBox = document.createElement('div');

                                deleteButtonDiv.appendChild(deleteButton);

                                listItem.appendChild(deleteButtonDiv);
                                listItem.appendChild(textNode);

                                commentBox.style.borderRadius = "5px";
                                commentBox.style.border = "1px solid black";
                                commentBox.style.boxSizing = "border-box";
                                commentBox.style.marginBottom = "10px";
                                
                                listItem.style.padding = "5px";

                                commentBox.appendChild(listItem);
                                
                                comments.appendChild(commentBox);
                              });          
                            }
                          }
                        



                          //Add event listener to createButton
                          createButton.addEventListener('click', () => {
                            if(inputField.value != "") {
                              const uniqueId = uuidv4();
                              const tempVal = inputField.value;
                              const userConfirmed = confirm('Are you sure you want to add this item?');
                              if(userConfirmed) {
                                newItems.set(uniqueId, inputField.value); //add with unique key
                                
                                addCommentToAPI(urn, String(props.dbId), uniqueId, inputField.value);
                                showComments();
                                inputField.value = "";
                                Keyboard.hide();
                                inputField.blur();
                              }
                              else{
                               inputField.value = tempVal; 
                              }
                            }
                          });

                          //addEvemtListener to inputField so user can add comment with pressing enter
                          inputField.addEventListener('keydown', (event) => {
                            if (event.key === 'Enter') {
                              event.preventDefault();
                              createButton.click();
                            }
                          });


                          let newItems: Map<string, string> = new Map<string, string>();     

                          const fetchComments = async () => { 
                            try {
                              let tempResponse: any = await getCommentsFromAPI(urn, String(dbId));
                              tempResponse.forEach((value: string, key: string) => {
                                newItems.set(key, value);
                              });
                              showComments();
                            } catch (error) {
                              console.error('Error while fetching comments:', error);
                            }
                          }
                          
                          fetchComments();

                          infoDiv.style.display = 'block';
                      }
                  });
              }
          });
            viewer.resize();
            resolve(model);
        }


        function onDocumentLoadFailure(code: any, message: any, errors: any) {
            reject({ code, message, errors });
        }

        viewer.setLightPreset(0);
        Autodesk.Viewing.Document.load('urn:' + urn, onDocumentLoadSuccess, onDocumentLoadFailure);
    });

    
}

}
