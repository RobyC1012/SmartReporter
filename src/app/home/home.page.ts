import { ImageService } from './../services/image.service';
import { DataService, Report } from './../services/data.service';
import { ChangeDetectorRef, Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { AlertController, LoadingController, ModalController } from '@ionic/angular';
import { DocumentData } from '@angular/fire/firestore';
import { ModalPage } from '../modal/modal.page';
//import geolocation
import { Geolocation } from '@capacitor/geolocation';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  profile!: DocumentData;
  reports: Report[] = [];
  constructor(
    private dataService: DataService,
    private authService: AuthService,
    private cd: ChangeDetectorRef,
    private router: Router,
    private loadingController: LoadingController,
    private alertController: AlertController,
    private modalController: ModalController,
    private imageService: ImageService
  ) {
    this.dataService.getUserProfile().subscribe((data) => {
      this.profile = data;
    });
    this.dataService.getReports().subscribe(res => {
      this.reports = res;
      this.cd.detectChanges();
    });
  }
  async logout() {
    await this.authService.logout();
    this.router.navigateByUrl('/', { replaceUrl: true });
  }
  async changeImage() {
    const image = await this.imageService.getImage();
    if (image) {
      const loading = await this.loadingController.create();
      await loading.present();
      const result = await this.dataService.setProfileImage(image); loading.dismiss();
      if (!result) {
        const alert = await this.alertController.create({
          header: 'Upload failed',
          message: 'There was a problem uploading your avatar.', buttons: ['OK'],
        });
        await alert.present();
      }
    }
  }
  async openReport(report: Report) {
    const modal = await this.modalController.create({
      component: ModalPage,
      componentProps: { id: report.id },
    });
    await modal.present();
  }
  async addReport() {
    //get current location
    const coordinates = await Geolocation.getCurrentPosition();
    //get latitude and longitude from coordinates
    const lat = coordinates.coords.latitude;
    const long = coordinates.coords.longitude;
    
    const alert = await this.alertController.create({
      header: 'Add Report',
      inputs: [
        { name: 'title', placeholder: 'My cool report', type: 'text' }, { name: 'text', placeholder: 'Some details', type: 'textarea' }],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Add',
          handler: async (res) => {
            const report: Report = { text: res.text, title: res.title, imageUrl: '', latitude:lat, longitude:long};
            await this.dataService.setImage(report, await this.imageService.getImage()); await this.dataService.addReport(report);
          }
        }
      ]
    });
    await alert.present();
  }
}