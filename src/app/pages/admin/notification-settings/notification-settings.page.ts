import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from "primeng/table";
import { TagModule } from "primeng/tag";
import {AdminSettingsService} from "../../../features/admin-settings/services/admin-settings.service";
import {NotificationSettingsDTO} from "../../../features/admin-settings/models/notification-config.dto";

@Component({
  selector: 'app-notification-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonModule, ToastModule, InputTextModule, TableModule, TagModule],
  templateUrl: './notification-settings.page.html',
  styleUrls: ['./notification-settings.page.scss'],
  providers: [MessageService]
})
export class NotificationSettingsPage implements OnInit {
  private fb = inject(FormBuilder);
  private adminSettingsService = inject(AdminSettingsService);
  private messageService = inject(MessageService);

  settingsForm!: FormGroup;
  isLoading = false;

  editingAlertDays: number[] = [];
  editingRecipientEmails: string[] = [];
  savedSettings: NotificationSettingsDTO | null = null;

  ngOnInit(): void {
    this.settingsForm = this.fb.group({
      dia: [null, [Validators.pattern("^[0-9]*$")]],
      email: [null, [Validators.email]]
    });

    this.loadSettings();
  }

  loadSettings(): void {
    this.isLoading = true;
    this.adminSettingsService.getNotificationSettings().subscribe({
      next: (data) => {
        this.savedSettings = data;
        this.editingAlertDays = [];
        this.editingRecipientEmails = [];
        this.isLoading = false;
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível carregar as configurações.' });
        this.isLoading = false;
      }
    });
  }

  addDay(): void {
    const diaControl = this.settingsForm.get('dia');
    if (diaControl?.valid && diaControl.value) {
      const dia = Number(diaControl.value);
      if (!this.editingAlertDays.includes(dia)) {
        this.editingAlertDays.push(dia);
        this.editingAlertDays.sort((a, b) => a - b);
      }
      diaControl.reset();
    }
  }

  removeDay(day: number): void {
    this.editingAlertDays = this.editingAlertDays.filter(d => d !== day);
  }

  addEmail(): void {
    const emailControl = this.settingsForm.get('email');
    if (emailControl?.valid && emailControl.value) {
      const email = emailControl.value.toLowerCase();
      if (!this.editingRecipientEmails.includes(email)) {
        this.editingRecipientEmails.push(email);
      }
      emailControl.reset();
    }
  }

  removeEmail(email: string): void {
    this.editingRecipientEmails = this.editingRecipientEmails.filter(e => e !== email);
  }

  saveSettings(): void {
    if (this.editingAlertDays.length === 0 || this.editingRecipientEmails.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'É necessário adicionar pelo menos um dia e um e-mail.'
      });
      return;
    }

    this.isLoading = true;
    const configData: NotificationSettingsDTO = {
      alertDays: this.editingAlertDays,
      recipientEmails: this.editingRecipientEmails
    };

    this.adminSettingsService.updateNotificationSettings(configData).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Configurações salvas!' });
        this.loadSettings();
      },
      error: () => {
        this.isLoading = false;
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível salvar as configurações.' });
      }
    });
  }
}
