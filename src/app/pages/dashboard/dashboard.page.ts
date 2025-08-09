import {Component, inject, OnInit} from '@angular/core';
import {CommonModule} from "@angular/common";
import {EmpresaService} from "../../features/empresa/services/empresa.service";
import {Empresa} from "../../features/empresa/models/empresa.model";
import {CardModule} from 'primeng/card';
import {DividerModule} from 'primeng/divider';
import {TableModule} from "primeng/table";
import {ButtonModule} from "primeng/button";
import {TooltipModule} from "primeng/tooltip";
import {TagModule} from "primeng/tag";
import {Router} from "@angular/router";
import { createDateFromYYYYMMDD } from '../../utils/date.utils';
import {environment} from "../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {AlvaraVencendoDTO, DashboardSummaryDTO} from "./models/dashboard.dto";

interface AlvaraVencendo {
  empresa: Empresa;
  tipoAlvara: string;
  vencimento: Date;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    DividerModule,
    TableModule,
    ButtonModule,
    TooltipModule,
    TagModule,
  ],
  templateUrl: './dashboard.page.html',
  styleUrl: './dashboard.page.scss'
})
export class DashboardPage implements OnInit {

  empresas: Empresa[] = [];
  alvarasVencendo30: AlvaraVencendo[] = [];
  proximosVencimentos: AlvaraVencendo[] = [];
  alvarasVencidos: AlvaraVencendo[] = [];
  totalEmpresas = 0;
  totalAlvarasVencidos = 0;

  private empresaService = inject(EmpresaService);
  private router = inject(Router);
  private http = inject(HttpClient);
  private readonly dashboardApiUrl = `${environment.apiUrl}/dashboard/summary`;

  ngOnInit() {
    this.carregarDadosDashboard();
  }

  carregarDadosDashboard() {
    if (environment.useMockData) {
      this.empresaService.buscarEmpresas().subscribe(data => {
        this.empresas = data;
        this.totalEmpresas = data.length;
        this.filtrarEmpresasComVencimentoProximo();
      });
    } else {
      this.http.get<DashboardSummaryDTO>(this.dashboardApiUrl).subscribe({
        next: (summary) => {
          this.totalEmpresas = summary.totalEmpresas;
          this.totalAlvarasVencidos = summary.totalAlvarasVencidos;

          const mapDtoToAlvaraVencendo = (dto: AlvaraVencendoDTO): AlvaraVencendo => ({
            empresa: { id: dto.empresaId, name: dto.nomeEmpresa } as Empresa,
            tipoAlvara: dto.tipoAlvara,
            vencimento: createDateFromYYYYMMDD(dto.dataVencimento)!
          });

          this.alvarasVencendo30 = (summary.alvarasVencendo30Dias || []).map(mapDtoToAlvaraVencendo);
          this.proximosVencimentos = (summary.proximosVencimentos || []).map(mapDtoToAlvaraVencendo);
        },
        error: (err) => {
          console.error('Erro ao carregar dados do dashboard:', err);
        }
      });
    }
  }

  private filtrarEmpresasComVencimentoProximo() {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const trintaDias = new Date(hoje);
    trintaDias.setDate(hoje.getDate() + 30);
    trintaDias.setHours(23, 59, 59, 999);

    let todosVencimentos: AlvaraVencendo[] = [];
    this.empresas.forEach(empresa => {
      todosVencimentos = todosVencimentos.concat(this.extrairAlvarasDeEmpresa(empresa));
    });

    const vencimentosOrdenados = todosVencimentos.sort((a, b) => a.vencimento.getTime() - b.vencimento.getTime());
    this.alvarasVencendo30 = vencimentosOrdenados.filter(v => v.vencimento >= hoje && v.vencimento <= trintaDias);
    const idsJaListados = new Set(this.alvarasVencendo30.map(v => `${v.empresa.id}-${v.tipoAlvara}`));
    this.proximosVencimentos = vencimentosOrdenados.filter(v => v.vencimento > trintaDias && !idsJaListados.has(`${v.empresa.id}-${v.tipoAlvara}`)).slice(0, 3);
    this.alvarasVencidos = todosVencimentos.filter(v => v.vencimento < hoje);
    this.totalAlvarasVencidos = this.alvarasVencidos.length;
  }

  private extrairAlvarasDeEmpresa(empresa: Empresa): AlvaraVencendo[] {
    const alvarasDaEmpresa: AlvaraVencendo[] = [];
    if (empresa.expLicenseFiredept) { alvarasDaEmpresa.push({ empresa, tipoAlvara: 'Bombeiros', vencimento: createDateFromYYYYMMDD(empresa.expLicenseFiredept)! }); }
    if (empresa.expLicenseSurveillance) { alvarasDaEmpresa.push({ empresa, tipoAlvara: 'Vigilância Sanitária', vencimento: createDateFromYYYYMMDD(empresa.expLicenseSurveillance)! }); }
    if (empresa.expLicensePolice) { alvarasDaEmpresa.push({ empresa, tipoAlvara: 'Polícia Civil', vencimento: createDateFromYYYYMMDD(empresa.expLicensePolice)! }); }
    if (empresa.expLicenseOperating) { alvarasDaEmpresa.push({ empresa, tipoAlvara: 'Funcionamento', vencimento: createDateFromYYYYMMDD(empresa.expLicenseOperating)! }); }
    return alvarasDaEmpresa;
  }

  calcularDiasParaVencimento(vencimento: Date): number {
    const hojeSemHora = new Date();
    hojeSemHora.setHours(0, 0, 0, 0);

    const vencimentoSemHora = new Date(vencimento);
    vencimentoSemHora.setHours(0, 0, 0, 0);

    const tempoRestante = vencimentoSemHora.getTime() - hojeSemHora.getTime();
    return Math.ceil(tempoRestante / (1000 * 3600 * 24));
  }

  defineTextoVencimento(vencimento: Date): string {
    const hojeSemHora = new Date();
    hojeSemHora.setHours(0, 0, 0, 0);

    const vencimentoSemHora = new Date(vencimento);
    vencimentoSemHora.setHours(0, 0, 0, 0);

    const tempoRestante = vencimentoSemHora.getTime() - hojeSemHora.getTime();
    const diasRestantes = Math.ceil(tempoRestante / (1000 * 3600 * 24));

    if (diasRestantes > 0) {
      return `${diasRestantes} DIAS`;
    } else if (diasRestantes === 0) {
      return 'HOJE';
    }
    else {
      return 'VENCIDO';
    }
  }

  definirCorDias(diasParaVencimento: number): 'success' | 'secondary' | 'info' | 'warning' | 'danger' | 'contrast' {
    if (diasParaVencimento < 0) {
      return 'danger';
    } else if (diasParaVencimento <= 10) {
      return 'warning';
    } else if (diasParaVencimento <= 30) {
      return 'info';
    } else {
      return 'secondary';
    }
  }

  irParaGerenciamentoAlvaras() {
    void this.router.navigate(['/empresas'], { queryParams: { filtro: 'vencidos' } });
  }

  irParaEmpresa(empresaId: number) {
    void this.router.navigate(['/empresas'], { queryParams: { filtro: 'empresa', id: empresaId } });
  }
}
