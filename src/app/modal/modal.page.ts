import { ImageService } from './../services/image.service';
import { DataService, Report } from './../services/data.service';
import { Component, Input, OnInit } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
@Component({
  selector: 'app-modal',
  templateUrl: './modal.page.html',
  styleUrls: ['./modal.page.scss'],
})
export class ModalPage implements OnInit {
  @Input() id!: string;
  report!: Report;
  constructor(
    private dataService: DataService,
    private modalController: ModalController,
    private toastController: ToastController,
    private imageService: ImageService
  ) { }
  ngOnInit() {
    this.dataService.getReportById(this.id).subscribe(res => {
      this.report = res;
    });
  }
  async deleteReport() {
    await this.dataService.deleteReport(this.report);
    this.modalController.dismiss();
  }
  async updateReport() {
    await this.dataService.updateReport(this.report); const toast = await this.toastController.create({
      message: 'Report updated!.',
      duration: 2000
    });
    toast.present();
    this.modalController.dismiss();
  }
  async setImage() {
    const res = await this.dataService.setImage(this.report, await this.imageService.getImage()); if (res) {
      await this.updateReport();
    }
  }
  async cancel() {
    this.modalController.dismiss();
  }
}