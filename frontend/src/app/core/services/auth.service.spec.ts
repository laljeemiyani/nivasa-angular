import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);

    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should store token and update state on successful login', (done) => {
    const mockCredentials = { email: 'test@example.com', password: 'password' };
    const mockResponse = {
      token: 'fake-jwt-token',
      user: { id: 1, email: 'test@example.com', role: 'resident' },
    };

    service.login(mockCredentials).subscribe((response) => {
      expect(response).toEqual(mockResponse);
      expect(localStorage.getItem('token')).toBe('fake-jwt-token');
      expect(localStorage.getItem('user')).toBe(
        JSON.stringify(mockResponse.user),
      );

      // Check BehaviorSubject state
      service.state$.subscribe((state) => {
        expect(state.isAuthenticated).toBeTrue();
        expect(state.user).toEqual(mockResponse.user);
        expect(state.token).toBe('fake-jwt-token');
        done();
      });
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  it('should clear token and state on logout', (done) => {
    // Pre-populate state
    localStorage.setItem('token', 'fake-jwt-token');
    service['stateSubject'].next({
      user: { id: 1, email: 'test@example.com', role: 'resident' },
      token: 'fake-jwt-token',
      isAuthenticated: true,
      loading: false,
    });

    service.logout();

    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();

    service.state$.subscribe((state) => {
      expect(state.isAuthenticated).toBeFalse();
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      done();
    });
  });
});
