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
import {ConfiguracaoNotificacaoDTO} from "../../../features/admin-settings/models/notification-config.dto";

@Component({
  selector: 'app-notification-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonModule, ToastModule, InputTextModule, TableModule, TagModule],
  templateUrl: './notification-settings.component.html',
  styleUrls: ['./notification-settings.component.scss'],
  providers: [MessageService]
})
export class NotificationSettingsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private adminSettingsService = inject(AdminSettingsService);
  private messageService = inject(MessageService);

  settingsForm!: FormGroup;
  isLoading = false;

  diasAlertaEditando: number[] = [];
  emailsDestinoEditando: string[] = [];
  configuracaoSalva: ConfiguracaoNotificacaoDTO | null = null;

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
        this.configuracaoSalva = data;
        this.diasAlertaEditando = [];
        this.emailsDestinoEditando = [];
        this.isLoading = false;
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível carregar as configurações.' });
        this.isLoading = false;
      }
    });
  }

  adicionaDia(): void {
    const diaControl = this.settingsForm.get('dia');
    if (diaControl?.valid && diaControl.value) {
      const dia = Number(diaControl.value);
      if (!this.diasAlertaEditando.includes(dia)) {
        this.diasAlertaEditando.push(dia);
        this.diasAlertaEditando.sort((a, b) => a - b);
      }
      diaControl.reset();
    }
  }

  removeDia(dia: number): void {
    this.diasAlertaEditando = this.diasAlertaEditando.filter(d => d !== dia);
  }

  adicionaEmail(): void {
    const emailControl = this.settingsForm.get('email');
    if (emailControl?.valid && emailControl.value) {
      const email = emailControl.value.toLowerCase();
      if (!this.emailsDestinoEditando.includes(email)) {
        this.emailsDestinoEditando.push(email);
      }
      emailControl.reset();
    }
  }

  removeEmail(email: string): void {
    this.emailsDestinoEditando = this.emailsDestinoEditando.filter(e => e !== email);
  }

  saveSettings(): void {
    if (this.diasAlertaEditando.length === 0 || this.emailsDestinoEditando.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'É necessário adicionar pelo menos um dia e um e-mail.'
      });
      return;
    }

    this.isLoading = true;
    const configData: ConfiguracaoNotificacaoDTO = {
      diasAlerta: this.diasAlertaEditando,
      emailsDestino: this.emailsDestinoEditando
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
