import {ComponentFixture, TestBed} from '@angular/core/testing'; // Removido fakeAsync e tick
import {FormsModule} from '@angular/forms';
import {Router} from '@angular/router';
import {ButtonModule} from 'primeng/button';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {By} from '@angular/platform-browser';

import {LoginPage} from './login.page';
import {AuthService} from '../../core/auth/auth.service';

describe('LoginPage', () => {
  let component: LoginPage;
  let fixture: ComponentFixture<LoginPage>;

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj('AuthService', ['login']);
    const routerSpyObj = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [LoginPage, FormsModule, ButtonModule, NoopAnimationsModule],
      providers: [
        {provide: AuthService, useValue: authSpy},
        {provide: Router, useValue: routerSpyObj}
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve ser criado', () => {
    expect(component).toBeTruthy();
  });

  it('deve manter o botão de login desabilitado se o formulário estiver inválido', async () => {
    await fixture.whenStable();
    fixture.detectChanges();

    const submitButton = fixture.debugElement.query(By.css('button[type="submit"]')).nativeElement;
    expect(submitButton.disabled).toBe(true);
  });

  it('deve habilitar o botão de login quando o formulário for preenchido', async () => {
    const usernameInput = fixture.debugElement.query(By.css('input[name="usuario"]')).nativeElement;
    const passwordInput = fixture.debugElement.query(By.css('input[name="senha"]')).nativeElement;

    usernameInput.value = 'admin';
    usernameInput.dispatchEvent(new Event('input'));
    passwordInput.value = '123';
    passwordInput.dispatchEvent(new Event('input'));

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const submitButton = fixture.debugElement.query(By.css('button[type="submit"]')).nativeElement;
    expect(submitButton.disabled).toBe(false);
  });
});
