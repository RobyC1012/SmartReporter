import { Injectable } from '@angular/core'; import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
@Injectable({
  providedIn: 'root'
})
export class ImageService {
  constructor() { }
  async getImage() {
    let image!: Photo;
    try {
      image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Base64, source: CameraSource.Prompt, // Camera, Photos or Prompt!});
      });
    } catch (e) { }
      return image;
    }
}
