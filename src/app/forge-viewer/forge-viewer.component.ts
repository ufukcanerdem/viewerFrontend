import { Component, model, OnInit } from '@angular/core';
import { ViewerService } from '../services/viewer.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModelsService } from '../services/models.service';
import { lastValueFrom, Observable } from 'rxjs';
import { FinalizeUploadResponse, ManifestResponse, ModelDetail, ModelResponseItem, SignedUrlResponse, TranslatedFile } from '../interfaces';
import { CommentsService } from '../services/comments.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-viewer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './forge-viewer.component.html',
  styleUrls: ['./forge-viewer.component.scss'],
  providers: [ViewerService, ModelsService]
})
export class ForgeViewerComponent implements OnInit {

  //to .env
  baseCommentApiUrl: string = environment.BASE_COMMENT_API_URL;

  private viewer: any;
  private modelsResponse: { items: ModelResponseItem[] } | undefined;
  private modelObjectsPure: any;

  constructor(
    private viewerService: ViewerService,
    private modelsService: ModelsService,
    private commentsService: CommentsService
  ) {
  }

  ngOnInit(): void {
    this.initViewer();
  }

  getModel(): any {
    return this.modelsService.getModels();
  }

  private async initViewer() {
    const previewContainer = document.getElementById('preview');
    if (previewContainer) {
      this.viewer = await this.viewerService.initViewer(previewContainer as HTMLElement);

      //INIT MODELS
      this.modelsResponse = await lastValueFrom(this.getModel());
      ///this.authToken = JSON.parse(response.body)['access_token'];
      //Handle the token response as needed
      if (this.modelsResponse && this.modelsResponse.items) {
        this.modelObjectsPure = this.modelsResponse.items.map((item: ModelResponseItem) => {
          return { urn: item.objectId, name: item.objectKey };
        });
      } else {
        console.error('Response is not available or does not contain items.');
      }

      const urn = window.location.hash?.substring(1);
      this.setupModelSelection(urn, false, true);
      this.setupModelUpload();
    }
  }

  createModelInCommentsAPI(modelURN: string): Observable<any> {
    return this.commentsService.createModel(modelURN);
  }

  private async setupModelSelection(selectedUrn: string, isAfterUpload: boolean, isInitial: boolean) {
    const dropdown = document.getElementById('models') as HTMLSelectElement | null;
    
    
    
    //Converting objects into URN
    //Problemmmm, After uploading a file, it changes already created urns!!!
    if (!isAfterUpload) {

      //GOOOOOD EXAMPLE OF USING INFUNCTION DEFINITION TO MAKE THAT PART ASYNC AND AWAIT FOR REQUESTS
      const createComments = async () => {
        for (const detail of this.modelObjectsPure) {
          detail.urn = btoa(detail.urn);
    
          if (isInitial) {
    
          try {
            const response = await lastValueFrom(this.createModelInCommentsAPI(detail.urn));
          } catch (error) {
            console.error('Error in commentsService:', error);
          }
    
          }
        }
      };
    
      //WE'RE CALLING ARROW FUNC DEFINITION WE MADE JUST ABOVE
      //await in here is important !!!
      await createComments();
    } 

    //OLD NON-ASYNC ONE!!!
    /* if(!isAfterUpload) {
      this.modelObjectsPure.forEach( (detail: ModelDetail) => {
        detail.urn = btoa(detail.urn);

        if(isInitial)
          this.createModelInCommentsAPI(detail.urn).subscribe(response =>{
          })

      });
    } */
    

    if(isAfterUpload) {

      const createCommentForUploadedObject = async () => { 
        try {
          const response = await lastValueFrom(this.createModelInCommentsAPI(btoa(selectedUrn)));
        } catch (error) {
          console.error('Error in commentsServiceAfterUpload:', error);
        }
      }

      this.modelsResponse = await lastValueFrom(this.getModel());
      ///this.authToken = JSON.parse(response.body)['access_token'];
      // Handle the token response as needed
      if (this.modelsResponse && this.modelsResponse.items) {
        this.modelObjectsPure = this.modelsResponse.items.map((item: ModelResponseItem) => {
          return { urn: item.objectId, name: item.objectKey };
        });
      } else {
        console.error('Response is not available or does not contain items.');
      }

      this.modelObjectsPure.forEach( (detail: ModelDetail) => {
        detail.urn = btoa(detail.urn);
      });

      await createCommentForUploadedObject();

    }

    /* const testData= [
      {
          "name": "Wall-e beta.fbx",
          "urn": "dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6cDVxcnFmeTd4c2dobXI1c2F2bHUwd21scm0wczVpOHBuMXAwZnVja2kzdjlkbm50LWJhc2ljLWFwcC9XYWxsLWUlMjBiZXRhLmZieA"
      },
      {
        "name": "bugatti",
        "urn": "dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6dWUtdGVzdC0xL2J1Z2F0dGkub2Jq"
      },
      {
        "name": "Audi E tron.fbx",
        "urn": testUrn
      }
  ]; */
    if (dropdown) {
      dropdown.innerHTML = '';
      try {
        const models = this.modelObjectsPure;
        var tempModelName = "";
        dropdown.innerHTML = models
          .map(
            (model: any) =>{
              if( model.urn === selectedUrn) {
                tempModelName = model.name;
              }
              return `<option value=${model.urn} ${model.urn === selectedUrn ? 'selected' : ''}>${model.name}</option>`;
            })
          .join('\n');
        dropdown.onchange = () => {
          this.onModelSelected(dropdown.value, tempModelName);
        }
        if (dropdown.value) {
          this.onModelSelected(dropdown.value, tempModelName);
        }

      } catch (err) {
        alert('Could not list models. See the console for more details.');
        console.error(err);
      }
    }
  }

  private async setupModelUpload() {
    const upload = document.getElementById('upload') as HTMLButtonElement | null;
    const input = document.getElementById('input') as HTMLInputElement | null;
    const models = document.getElementById('models') as HTMLSelectElement | null;

    if (upload && input && models) {
      upload.onclick = () => input.click();
      input.onchange = async () => {
        if (input.files && input.files.length > 0) {
          const file = input.files[0];
          let data = new FormData();
          data.append('model-file', file);
          if (file.name.endsWith('.zip')) {
            const entrypoint = window.prompt('Please enter the filename of the main design inside the archive.');
            if (entrypoint) {
              data.append('model-zip-entrypoint', entrypoint);
            }
          }
          upload.setAttribute('disabled', 'true');
          models.setAttribute('disabled', 'true');
          this.showNotification(`Uploading model <em>${file.name}</em>. Do not reload the page.`);

          try {
            //GET request: create signedUploadURL
            const resp1: SignedUrlResponse  = await lastValueFrom(this.modelsService.getObtainSignedUrl(file.name, "10"));
            
            //PUT request: UPLOAD FILE
            await lastValueFrom(this.modelsService.uploadFileWithSignedUrl(resp1.urls[0], file));

            const resp3: FinalizeUploadResponse = await lastValueFrom(this.modelsService.finalizeUpload(file.name, resp1.uploadKey));
            
            const base64ObjectID = btoa(resp3.objectId);
            
            const resp4: TranslatedFile = await lastValueFrom(this.modelsService.startTranslationOfFile(base64ObjectID));
          
            this.setupModelSelection(btoa(resp3.objectId), true, false);
          } catch (err) {
            alert(`Could not upload model ${file.name}. See the console for more details.`);
            console.error(err);
          } finally {
            this.clearNotification();
            upload.removeAttribute('disabled');
            models.removeAttribute('disabled');
            input.value = '';
          }
        }
      };
    }
  }

  private async onModelSelected(urn: string, modelName: string) {

    //HTML ELEMENTS
    const upload = document.getElementById('upload') as HTMLButtonElement | null;
    const input = document.getElementById('input') as HTMLInputElement | null;
    const models = document.getElementById('models') as HTMLSelectElement | null;

    if ((window as any).onModelSelectedTimeout) {
      clearTimeout((window as any).onModelSelectedTimeout);
      delete (window as any).onModelSelectedTimeout;
    }
    window.location.hash = urn;
    try {
      var resp5: ManifestResponse = await lastValueFrom(this.modelsService.checkManifest(urn));
      
      if(resp5.status != "success") {
        if(upload && input && models) { //Disable HTML elements
          upload.setAttribute('disabled', 'true');
          models.setAttribute('disabled', 'true');
          input.setAttribute('disabled', 'true');
        }
        if(resp5.status != "failed") {
          this.showNotification(`Model is still translating, Please wait... It may take a minute.`);
        }
      }
      
      var isFailed = false;

      while(resp5.status != "success") {
        if(resp5.status == "failed") {
          isFailed = true;
          break;
        }
        await new Promise(resolve => setTimeout(resolve, 5000)); // 5s delay
        this.printCurrentTime();
        resp5 = await lastValueFrom(this.modelsService.checkManifest(urn));
        if(resp5.status == "success") {
          if(upload && input && models) { //Enable HTML elements
            upload.removeAttribute('disabled');
            models.removeAttribute('disabled');
            input.removeAttribute('disabled');
          }
          break;
        }
      }

      if(isFailed) {
        this.clearNotification();
        this.showNotification(`Translation of "${modelName}" failed. Can not load model!`);
        await new Promise(resolve => setTimeout(resolve, 2000)); // 2s delay
        this.clearNotification();
        if(upload && input && models) { //Enable HTML elements
          upload.removeAttribute('disabled');
          models.removeAttribute('disabled');
          input.removeAttribute('disabled');
        }
      }
      else{
        this.clearNotification();
        await this.viewerService.loadModel(this.viewer, urn);
      }

    } catch (err) {
      alert('Could not load model. See the console for more details.');
      console.error(err);
    }
  }

  private showNotification(message: string) {
    const overlay = document.getElementById('overlay');
    if (overlay) {
      overlay.innerHTML = `<div class="notification">${message}</div>`;
      overlay.style.display = 'flex';
    }
  }

  private clearNotification() {
    const overlay = document.getElementById('overlay');
    if (overlay) {
      overlay.innerHTML = '';
      overlay.style.display = 'none';
    }
  }

  printCurrentTime(): void {
    const currentTime = new Date();
  }
}
