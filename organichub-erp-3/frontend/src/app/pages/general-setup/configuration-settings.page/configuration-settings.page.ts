import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { PageSubHeaderComponent } from '../../../components/page-sub-header/page-sub-header';
import { OrganicToast } from '../../../components/organic-toast/organic-toast';
import { ToastService } from '../../../components/organic-toast/toast.service';
import {
  ConfigurationSettingsService,
  ConfigurationSetting
} from '../../../services/configuration-settings.service';

@Component({
  selector: 'app-configuration-settings-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PageSubHeaderComponent,
    OrganicToast
  ],
  templateUrl: './configuration-settings.page.html',
  styleUrls: ['./configuration-settings.page.css']
})
export class ConfigurationSettingsPageComponent implements OnInit {

  showModal = false;
  isEditMode = false;

  config: ConfigurationSetting = this.createEmptyModel();
  configurations: ConfigurationSetting[] = [];

  constructor(
    private router: Router,
    private toast: ToastService,
    private service: ConfigurationSettingsService
  ) {}

  ngOnInit(): void {
    this.loadAll();
  }

  // ===============================
  // LOAD
  // ===============================
  loadAll(): void {
    this.service.getAll().subscribe({
      next: res => this.configurations = res,
      error: () => this.toast.error('Failed to load data')
    });
  }

  getByModule(module: string) {
    return this.configurations.filter(x => x.module === module);
  }

  // ===============================
  // ADD
  // ===============================
  onAdd(): void {
    this.config = this.createEmptyModel();
    this.isEditMode = false;
    this.showModal = true;
  }

  onClose(): void {
    this.showModal = false;
  }

  // ===============================
  // SAVE
  // ===============================
  onSave(): void {

    if (!this.config.module || !this.config.configurationName.trim()) {
      this.toast.error('Required fields missing');
      return;
    }

    if (this.isEditMode && this.config.id) {
      this.service.update(this.config.id, this.config).subscribe({
        next: () => {
          this.toast.success('Updated successfully');
          this.loadAll();
          this.onClose();
        }
      });
    } else {
      this.service.create(this.config).subscribe({
        next: () => {
          this.toast.success('Saved successfully');
          this.loadAll();
          this.onClose();
        }
      });
    }
  }

  // ===============================
  // EDIT
  // ===============================
  editConfig(item: ConfigurationSetting): void {
    this.config = { ...item };
    this.isEditMode = true;
    this.showModal = true;
  }

  // ===============================
  // DELETE
  // ===============================
  deleteConfig(id: number): void {
    this.service.delete(id).subscribe({
      next: () => {
        this.toast.success('Deleted successfully');
        this.loadAll();
      }
    });
  }

  onBack(): void {
    this.router.navigate(['/general-setup/company-setup']);
  }

  private createEmptyModel(): ConfigurationSetting {
    return {
      module: '',
      configurationCode: '',
      configurationName: '',
      isEnabled: true,
      remarks: ''
    };
  }
}