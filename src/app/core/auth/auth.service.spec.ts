import {TestBed} from '@angular/core/testing';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {Router} from '@angular/router';
import {AuthService} from './auth.service';
import {environment} from '../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpTestingController: HttpTestingController;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
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
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  afterEach(() => {
    httpTestingController.verify();
    localStorage.clear();
  });

  it('deve ser criado', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    it('deve autenticar, salvar o token e notificar os inscritos em caso de sucesso', () => {
      spyOn(localStorage, 'setItem').and.callThrough();
      let isLoggedIn = false;
      service.isLoggedIn().subscribe(status => isLoggedIn = status);

      const mockResponse = {token: 'token.real.jwt'};
      const credentials = {login: 'admin', senha: '123'};

      service.login(credentials).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpTestingController.expectOne(`${environment.apiUrl}/auth/login`);
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);

      expect(localStorage.setItem).toHaveBeenCalledWith('auth_token', 'token.real.jwt');
      expect(isLoggedIn).toBe(true);
    });

    it('deve retornar null e chamar o logout em caso de falha na autenticação', () => {
      spyOn(localStorage, 'removeItem').and.callThrough();
      const credentials = {login: 'admin', senha: 'errada'};

      service.login(credentials).subscribe(response => {
        expect(response).toBeNull();
      });

      const req = httpTestingController.expectOne(`${environment.apiUrl}/auth/login`);
      req.flush('Credenciais inválidas', {status: 401, statusText: 'Unauthorized'});

      expect(localStorage.removeItem).toHaveBeenCalledWith('auth_token');
    });
  });


  describe('logout', () => {
    it('deve remover o token, notificar os inscritos e navegar para a tela de login', () => {
      localStorage.setItem('auth_token', 'token-existente');
      service.loadUserFromToken();

      spyOn(localStorage, 'removeItem').and.callThrough();
      let isLoggedIn = true;
      service.isLoggedIn().subscribe(status => isLoggedIn = status);

      service.logout();

      expect(localStorage.removeItem).toHaveBeenCalledWith('auth_token');
      expect(isLoggedIn).toBe(false);
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
    });
  });
});
