import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj('AuthService', ['login']);
    const navSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [LoginComponent, ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: navSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty email and password', () => {
    expect(component.loginForm.get('email')?.value).toBe('');
    expect(component.loginForm.get('password')?.value).toBe('');
    expect(component.loginForm.valid).toBeFalse();
  });

  it('should validate email format properly', () => {
    const emailControl = component.loginForm.get('email');
    emailControl?.setValue('invalidemail');
    expect(emailControl?.valid).toBeFalse();
    expect(emailControl?.errors?.['email']).toBeTruthy();

    emailControl?.setValue('valid@example.com');
    expect(emailControl?.valid).toBeTrue();
  });

  it('should not call login on AuthService if form is invalid', () => {
    component.onSubmit();
    expect(authServiceSpy.login).not.toHaveBeenCalled();
  });

  it('should call login and navigate to resident dashboard on success', () => {
    component.loginForm.setValue({
      email: 'resident@test.com',
      password: 'password123',
    });
    authServiceSpy.login.and.returnValue(
      of({ user: { role: 'resident' }, token: 'abc' }),
    );

    component.onSubmit();

    expect(authServiceSpy.login).toHaveBeenCalledWith({
      email: 'resident@test.com',
      password: 'password123',
    });
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/resident/dashboard']);
  });

  it('should call login and navigate to admin dashboard on success', () => {
    component.loginForm.setValue({
      email: 'admin@test.com',
      password: 'password123',
    });
    authServiceSpy.login.and.returnValue(
      of({ user: { role: 'admin' }, token: 'abc' }),
    );

    component.onSubmit();

    expect(authServiceSpy.login).toHaveBeenCalledWith({
      email: 'admin@test.com',
      password: 'password123',
    });
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/admin/dashboard']);
  });

  it('should set error message on login failure', () => {
    component.loginForm.setValue({
      email: 'wrong@test.com',
      password: 'wrong',
    });
    authServiceSpy.login.and.returnValue(
      throwError(() => ({ error: { message: 'Invalid credentials' } })),
    );

    component.onSubmit();

    expect(component.error).toBe('Invalid credentials');
    expect(component.isLoading).toBeFalse();
  });
});
