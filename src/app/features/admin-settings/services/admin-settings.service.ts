import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {delay, Observable, of} from 'rxjs';
import {environment} from "../../../environments/environment";
import {ConfiguracaoNotificacaoDTO} from "../models/notification-config.dto";

@Injectable({
  providedIn: 'root'
})
export class AdminSettingsService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/admin/notifications/settings`;

  private mockSettings: ConfiguracaoNotificacaoDTO = {
    diasAlerta: [15, 30, 60],
    emailsDestino: ['gerente@empresa.com', 'financeiro@empresa.com']
  };

  getNotificationSettings(): Observable<ConfiguracaoNotificacaoDTO> {
    if (environment.useMockData) {
      return of({ ...this.mockSettings }).pipe(delay(100));
    }

    return this.http.get<ConfiguracaoNotificacaoDTO>(this.apiUrl);
  }

  updateNotificationSettings(config: ConfiguracaoNotificacaoDTO): Observable<ConfiguracaoNotificacaoDTO> {
    if (environment.useMockData) {
      this.mockSettings = config;
      return of({ ...this.mockSettings }).pipe(delay(100));
    }

    return this.http.put<ConfiguracaoNotificacaoDTO>(this.apiUrl, config);
  }
}
