import {ComponentFixture, TestBed} from '@angular/core/testing';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {Router} from '@angular/router';
import {of} from 'rxjs';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';

import {DashboardPage} from './dashboard.page';
import {EmpresaService} from '../../features/empresa/services/empresa.service';
import {environment} from '../../environments/environment';
import {Empresa} from '../../features/empresa/models/empresa.model';
import {DashboardSummaryDTO} from "./models/dashboard.dto";

describe('DashboardPage', () => {
  let component: DashboardPage;
  let fixture: ComponentFixture<DashboardPage>;
  let httpTestingController: HttpTestingController;
  let empresaServiceSpy: jasmine.SpyObj<EmpresaService>;

  beforeEach(async () => {
    const empresaServiceSpyObj = jasmine.createSpyObj('EmpresaService', ['buscarEmpresas']);
    const routerSpyObj = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [DashboardPage, HttpClientTestingModule, NoopAnimationsModule],
      providers: [
        {provide: EmpresaService, useValue: empresaServiceSpyObj},
        {provide: Router, useValue: routerSpyObj}
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardPage);
    component = fixture.componentInstance;
    httpTestingController = TestBed.inject(HttpTestingController);
    empresaServiceSpy = TestBed.inject(EmpresaService) as jasmine.SpyObj<EmpresaService>;
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('deve ser criado', () => {
    expect(component).toBeTruthy();
  });

  describe('em Modo Mock', () => {
    beforeEach(() => {
      environment.useMockData = true;
    });

    it('deve calcular e exibir os KPIs a partir da lista de empresas mockada', () => {
      const mockEmpresas: Empresa[] = [
        {
          id: 1,
          nome: 'Vencida',
          vencBombeiros: '2020-01-01',
          vencFuncionamento: null,
          vencPolicia: null,
          vencVigilancia: null
        },
        {
          id: 2,
          nome: 'A Vencer',
          vencBombeiros: new Date().toISOString().split('T')[0],
          vencFuncionamento: null,
          vencPolicia: null,
          vencVigilancia: null
        },
      ];
      empresaServiceSpy.buscarEmpresas.and.returnValue(of(mockEmpresas));

      fixture.detectChanges();

      const element = fixture.nativeElement as HTMLElement;
      const totalEmpresasCard = element.querySelector('#monitoramento-empresas .card-number');

      expect(totalEmpresasCard?.textContent).toContain('2');
    });
  });

  describe('em Modo API Real', () => {
    beforeEach(() => {
      environment.useMockData = false;
    });

    it('deve buscar os dados do endpoint de summary e exibi-los', () => {
      const mockSummary: DashboardSummaryDTO = {
        totalEmpresas: 150,
        totalAlvarasVencidos: 25,
        alvarasVencendo30Dias: [],
        proximosVencimentos: []
      };

      fixture.detectChanges();

      const req = httpTestingController.expectOne(`${environment.apiUrl}/dashboard/summary`);
      expect(req.request.method).toBe('GET');
      req.flush(mockSummary);

      fixture.detectChanges();

      const element = fixture.nativeElement as HTMLElement;
      const totalEmpresasCard = element.querySelector('#monitoramento-empresas .card-number');
      const totalVencidosButton = element.querySelector('#monitoramento-empresas .btn-alvaras-vencidos');

      expect(totalEmpresasCard?.textContent).toContain('150');
      expect(totalVencidosButton?.textContent).toContain('25');
    });
  });
});
