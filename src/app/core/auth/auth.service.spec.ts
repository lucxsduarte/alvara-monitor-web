import {TestBed} from '@angular/core/testing';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {Router} from '@angular/router';
import {AuthService} from './auth.service';
import {environment} from '../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpTestingController: HttpTestingController;

  describe('em Modo API Real', () => {
    beforeEach(() => {
      environment.useMockData = false;
      const spy = jasmine.createSpyObj('Router', ['navigate']);

      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        providers: [
          AuthService,
          {provide: Router, useValue: spy}
        ]
      });

      service = TestBed.inject(AuthService);
      httpTestingController = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
      httpTestingController.verify();
      localStorage.clear();
    });

    it('deve autenticar, chamar a API e salvar o token em caso de sucesso', () => {
      spyOn(localStorage, 'setItem').and.callThrough();
      let isLoggedIn = false;
      service.isLoggedIn().subscribe(status => isLoggedIn = status);

      const mockResponse = {token: 'token.real.jwt.vindo.da.api'};
      const credentials = {login: 'admin', senha: '123'};

      service.login(credentials).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpTestingController.expectOne(`${environment.apiUrl}/auth/login`);
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);

      expect(localStorage.setItem).toHaveBeenCalledWith('auth_token', 'token.real.jwt.vindo.da.api');
      expect(isLoggedIn).toBe(true);
    });

    it('deve retornar null e chamar o logout em caso de falha na API', () => {
      spyOn(service, 'logout').and.callThrough();
      const credentials = {login: 'admin', senha: 'errada'};

      service.login(credentials).subscribe(response => {
        expect(response).toBeNull();
      });

      const req = httpTestingController.expectOne(`${environment.apiUrl}/auth/login`);
      req.flush('Credenciais inválidas', {status: 401, statusText: 'Unauthorized'});

      expect(service.logout).toHaveBeenCalled();
    });
  });

  describe('em Modo Mock', () => {
    beforeEach(() => {
      environment.useMockData = true;
      const spy = jasmine.createSpyObj('Router', ['navigate']);

      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        providers: [
          AuthService,
          {provide: Router, useValue: spy}
        ]
      });
      service = TestBed.inject(AuthService);
    });

    it('deve retornar um token mockado para credenciais de mock corretas', () => {
      const credentials = {login: 'admin', senha: '123'};
      const expectedToken = 'mock-token-jwt-para-desenvolvimento';

      service.login(credentials).subscribe(response => {
        expect(response).toBeTruthy();
        expect(response?.token).toBe(expectedToken);
      });
    });
  });
});
