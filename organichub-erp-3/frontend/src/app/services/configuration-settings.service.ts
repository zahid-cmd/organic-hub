import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ConfigurationSetting {
  id?: number;
  module: string;
  configurationCode: string;
  configurationName: string;
  isEnabled: boolean;
  remarks?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ConfigurationSettingsService {

  // ✅ MUST MATCH BACKEND PORT
  private baseUrl = 'http://localhost:5150/api/general-setup/configuration-settings';

  constructor(private http: HttpClient) {}

  // GET ALL
  getAll(): Observable<ConfigurationSetting[]> {
    return this.http.get<ConfigurationSetting[]>(this.baseUrl);
  }

  // CREATE
  create(data: ConfigurationSetting): Observable<any> {
    return this.http.post(this.baseUrl, data);
  }

  // UPDATE
  update(id: number, data: ConfigurationSetting): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, data);
  }

  // DELETE
  delete(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}