import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { EmpresaService } from './empresa.service';
import { environment } from '../../../environments/environment';
import { FiltroStatusEmpresa } from '../models/enums/FiltroStatusEmpresa';
import { Empresa } from '../models/empresa.model';

describe('EmpresaService', () => {
  let service: EmpresaService;
  let httpTestingController: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/empresas`;

  beforeEach(() => {
    environment.useMockData = false;

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [EmpresaService]
    });
    service = TestBed.inject(EmpresaService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('deve ser criado', () => {
    expect(service).toBeTruthy();
  });

  describe('buscarEmpresas', () => {
    it('deve chamar GET /empresas sem parâmetros quando nenhum filtro é fornecido', () => {
      service.buscarEmpresas().subscribe();

      const req = httpTestingController.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.keys().length).toBe(0);
      req.flush([]);
    });

    it('deve chamar GET /empresas com o parâmetro "nome"', () => {
      const nomeFiltro = 'Teste';
      service.buscarEmpresas(nomeFiltro).subscribe();

      const req = httpTestingController.expectOne(`${apiUrl}?nome=${nomeFiltro}`);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('nome')).toBe(nomeFiltro);
      req.flush([]);
    });

    it('deve chamar GET /empresas com o parâmetro "status"', () => {
      const statusFiltro = FiltroStatusEmpresa.VENCIDOS;
      service.buscarEmpresas(undefined, statusFiltro).subscribe();

      const req = httpTestingController.expectOne(`${apiUrl}?status=${statusFiltro}`);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('status')).toBe(statusFiltro);
      req.flush([]);
    });
  });

  it('deve chamar GET /empresas/{id} para buscar por id', () => {
    const idTeste = 123;
    service.buscarEmpresaPorId(idTeste).subscribe();

    const req = httpTestingController.expectOne(`${apiUrl}/${idTeste}`);
    expect(req.request.method).toBe('GET');
    req.flush({});
  });

  it('deve chamar POST /empresas com o corpo da empresa', () => {
    const novaEmpresa: Omit<Empresa, 'id'> = { nome: 'Nova Empresa', vencBombeiros: null, vencFuncionamento: null, vencPolicia: null, vencVigilancia: null };
    service.salvarEmpresa(novaEmpresa).subscribe();

    const req = httpTestingController.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(novaEmpresa);
    req.flush({});
  });

  it('deve chamar PUT /empresas/{id} com o corpo da empresa', () => {
    const empresaAtualizada: Empresa = { id: 1, nome: 'Empresa Atualizada', vencBombeiros: null, vencFuncionamento: null, vencPolicia: null, vencVigilancia: null };
    service.atualizarEmpresa(empresaAtualizada).subscribe();

    const req = httpTestingController.expectOne(`${apiUrl}/${empresaAtualizada.id}`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(empresaAtualizada);
    req.flush({});
  });

  it('deve chamar DELETE /empresas/{id}', () => {
    const idParaDeletar = 456;
    service.deletarEmpresa(idParaDeletar).subscribe();

    const req = httpTestingController.expectOne(`${apiUrl}/${idParaDeletar}`);
    expect(req.request.method).toBe('DELETE');
    req.flush({});
  });
});
