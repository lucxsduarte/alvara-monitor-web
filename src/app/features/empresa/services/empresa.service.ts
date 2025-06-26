import { inject, Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Observable, of } from "rxjs";
import { Empresa } from "../models/empresa.model";
import { environment } from "../../../environments/environment";
import {addDaysAndFormat} from "../../../utils/date.utils";

@Injectable({
  providedIn: 'root'
})
export class EmpresaService {
  private apiUrl = 'http://localhost:8080/api/empresas';
  private http = inject(HttpClient);
  private usarMock = environment.useMockData;

  private empresasBaseMock: Partial<Empresa>[] = [
    { id: 1, nome: "Alpha Alimentos" },
    { id: 2, nome: "Beta Construções" },
    { id: 3, nome: "Gama Logística" },
    { id: 4, nome: "Delta Saúde" },
    { id: 5, nome: "Epsilon Varejo" },
    { id: 6, nome: "Zeta Financeira" },
    { id: 7, nome: "Eta Transportes" },
    { id: 8, nome: "Theta Eventos" },
    { id: 9, nome: "Iota Consultoria" },
    { id: 10, nome: "Kappa Educacional" },
    { id: 11, nome: "Lambda Moda" },
    { id: 12, nome: "Mu Software" },
    { id: 13, nome: "Nu Energia" },
    { id: 14, nome: "Xi Agropecuária" },
    { id: 15, nome: "Omicron Estética" },
    { id: 16, nome: "Pi Engenharia" },
    { id: 17, nome: "Rho Imobiliária" },
    { id: 18, nome: "Sigma Hotelaria" },
    { id: 19, nome: "Tau Restaurante" },
    { id: 20, nome: "Upsilon Academia" }
  ];

  private empresasMockComDatas: Empresa[] | null = null;

  constructor() {
    if (this.usarMock) {
      this.empresasMockComDatas = this.generateDynamicMockData();
    }
  }

  getCompanies(): Observable<Empresa[]> {
    if (this.usarMock) {
      return of([...this.empresasMockComDatas!]);
    }
    return this.http.get<Empresa[]>(this.apiUrl);
  }

  saveCompany(empresa: Empresa): Observable<any> {
    if (this.usarMock) {
      const novoId = this.empresasMockComDatas!.length + 1;
      const novaEmpresa = { ...empresa, id: novoId };
      this.empresasMockComDatas!.push(novaEmpresa);
      return of(novaEmpresa);
    }
    return this.http.post(this.apiUrl, empresa);
  }

  deleteCompany(id: number): Observable<void> {
    if (this.usarMock) {
      this.empresasMockComDatas = this.empresasMockComDatas!.filter(emp => emp.id !== id);
      return of(void 0);
    }
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  updateCompany(empresa: Empresa): Observable<Empresa> {
    if (this.usarMock) {
      const index = this.empresasMockComDatas!.findIndex(e => e.id === empresa.id);
      if (index >= 0) {
        this.empresasMockComDatas![index] = empresa;
      }
      return of(empresa);
    }
    return this.http.put<Empresa>(`${this.apiUrl}/${empresa.id}`, empresa);
  }

  private generateDynamicMockData(): Empresa[] {
    const hoje = new Date();
    const mockData: Empresa[] = [];

    // 1. Empresa com alvará vencido (ex: 5 dias atrás)
    mockData.push({
      ...this.empresasBaseMock[0], // Alpha Alimentos
      vencBombeiros: addDaysAndFormat(hoje, -5),
      vencFuncionamento: addDaysAndFormat(hoje, 15),
      vencPolicia: addDaysAndFormat(hoje, 60),
      vencVigilancia: null
    } as Empresa);

    // 2. Empresa com alvará vencendo em breve (ex: 10 dias)
    mockData.push({
      ...this.empresasBaseMock[1],
      vencBombeiros: addDaysAndFormat(hoje, 10),
      vencFuncionamento: addDaysAndFormat(hoje, -20),
      vencPolicia: addDaysAndFormat(hoje, 90),
      vencVigilancia: null
    } as Empresa);

    // 3. Empresa com alvará vencendo após 30 dias (ex: 45 dias)
    mockData.push({
      ...this.empresasBaseMock[2],
      vencBombeiros: addDaysAndFormat(hoje, 45),
      vencFuncionamento: addDaysAndFormat(hoje, 120),
      vencPolicia: null,
      vencVigilancia: addDaysAndFormat(hoje, -10)
    } as Empresa);

    for (let i = 3; i < this.empresasBaseMock.length; i++) {
      const baseEmpresa = this.empresasBaseMock[i];
      const newEmpresa: Empresa = {
        id: baseEmpresa.id!,
        nome: baseEmpresa.nome!,
        vencBombeiros: Math.random() > 0.5 ? addDaysAndFormat(hoje, Math.floor(Math.random() * 180) - 30) : null,
        vencFuncionamento: Math.random() > 0.5 ? addDaysAndFormat(hoje, Math.floor(Math.random() * 180) - 30) : null,
        vencPolicia: Math.random() > 0.5 ? addDaysAndFormat(hoje, Math.floor(Math.random() * 180) - 30) : null,
        vencVigilancia: Math.random() > 0.5 ? addDaysAndFormat(hoje, Math.floor(Math.random() * 180) - 30) : null,
      };
      mockData.push(newEmpresa);
    }

    return mockData;
  }
}
