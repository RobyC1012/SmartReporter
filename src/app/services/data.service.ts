import { Injectable } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import {
  addDoc, collection, collectionData, deleteDoc, doc, docData,
  Firestore, setDoc, updateDoc
} from '@angular/fire/firestore';
import { getDownloadURL, ref, Storage, uploadString } from
  '@angular/fire/storage';
import { Photo } from '@capacitor/camera';
import { Observable } from 'rxjs';
import { LoadingController, AlertController } from '@ionic/angular';
export interface Report {
  id?: string;
  title: string;
  text: string;
  imageUrl: string;
  latitude: number;
  longitude: number;
}
@Injectable({
  providedIn: 'root'
})
export class DataService {
  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private storage: Storage,
    private loadingController: LoadingController,
    private alertController: AlertController,
  ) { }
  getReports(): Observable<Report[]> {
    const reportsRef = collection(this.firestore, 'reports'); 
    return collectionData(reportsRef, { idField: 'id' }) as Observable<Report[]>;
  }
  getReportById(id: string): Observable<Report> {
    const reportDocRef = doc(this.firestore, `reports/${id}`);
    return docData(reportDocRef, { idField: 'id' }) as Observable<Report>;
  }
  addReport(report: Report) {
    const reportsRef = collection(this.firestore, 'reports'); 
    return addDoc(reportsRef, report);
  }
  deleteReport(report: Report) {
    const reportDocRef = doc(this.firestore, `reports/${report.id}`);
    return deleteDoc(reportDocRef);
  }
  updateReport(report: Report) {
    const reportDocRef = doc(this.firestore, `reports/${report.id}`);
    return updateDoc(reportDocRef, { title: report.title, text: report.text, imageUrl: report.imageUrl });
  }
  getUserProfile() {
    const user = this.auth.currentUser;
    const userDocRef = doc(this.firestore, `users/${user!.uid}`);
    return docData(userDocRef, { idField: 'id' });
  }
  async uploadImage(cameraFile: Photo, imageName: string) {
    const user = this.auth.currentUser;
    const path = `uploads/${user!.uid}/${imageName}`;
    const storageRef = ref(this.storage, path);
    try {
      await uploadString(storageRef, cameraFile.base64String as string, 'base64');
      const imageUrl = await getDownloadURL(storageRef);
      return imageUrl;
    } catch (e) {
      return null;
    }
  }
  async setProfileImage(cameraFile: Photo) {
    const user = this.auth.currentUser;
    try {
      const imageUrl = await this.uploadImage(cameraFile, 'profile.png');
      const userDocRef = doc(this.firestore, `users/${user!.uid}`);
      await setDoc(userDocRef, { imageUrl });
      return imageUrl;
    } catch (e) {
      return null;
    }
  }
  async setImage(report: Report, image: Photo) {
    if (image) {
      const loading = await this.loadingController.create(); await loading.present();
      const imageUrl = await this.uploadImage(image, report.id + '.png');
      loading.dismiss();
      if (!imageUrl) {
        const alert = await this.alertController.create({
          header: 'Upload failed',
          message: 'There was a problem uploading your image.', buttons: ['OK'],
        });
        await alert.present();
      } else {
        report.imageUrl = imageUrl;
        return imageUrl;
      }
    }
    return null;
  }
}