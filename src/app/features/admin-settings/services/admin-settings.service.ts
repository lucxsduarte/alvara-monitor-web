import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {delay, Observable, of} from 'rxjs';
import {environment} from "../../../environments/environment";
import {NotificationSettingsDTO} from "../models/notification-config.dto";

@Injectable({
  providedIn: 'root'
})
export class AdminSettingsService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/admin/notifications/settings`;

  private mockSettings: NotificationSettingsDTO = {
    alertDays: [15, 30, 60],
    recipientEmails: ['gerente@empresa.com', 'financeiro@empresa.com']
  };

  getNotificationSettings(): Observable<NotificationSettingsDTO> {
    if (environment.useMockData) {
      return of({ ...this.mockSettings }).pipe(delay(100));
    }

    return this.http.get<NotificationSettingsDTO>(this.apiUrl);
  }

  updateNotificationSettings(config: NotificationSettingsDTO): Observable<NotificationSettingsDTO> {
    if (environment.useMockData) {
      this.mockSettings = config;
      return of({ ...this.mockSettings }).pipe(delay(100));
    }

    return this.http.put<NotificationSettingsDTO>(this.apiUrl, config);
  }
}
