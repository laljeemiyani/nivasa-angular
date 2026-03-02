describe('Nivasa Web Main Flows (React->Angular Migrated)', () => {
  beforeEach(() => {
    // Reset state before tests if needed
    cy.clearLocalStorage();
  });

  it('should display validation errors on empty login submission', () => {
    cy.visit('/login');
    cy.get('button[type="submit"]').click();

    // Verify Angular Reactive Forms validation
    cy.contains('Email is required').should('be.visible');
    cy.contains('Password is required').should('be.visible');
  });

  it('should successfully log in a Resident and redirect to Resident Dashboard', () => {
    cy.visit('/login');

    cy.get('input[formControlName="email"]').type('owner@nivasa.com');
    cy.get('input[formControlName="password"]').type('Password@123');
    cy.get('button[type="submit"]').click();

    // Verify routing and layout component rendered
    cy.url().should('include', '/resident/dashboard');
    cy.contains('Resident Dashboard').should('be.visible');

    // Verify Sidebar exists
    cy.get('nav').should('exist');
    cy.contains('My Complaints').should('be.visible');

    // Verify AuthService stored token
    cy.window().then((win) => {
      expect(win.localStorage.getItem('token')).to.be.a('string');
      expect(win.localStorage.getItem('user')).to.include('owner@nivasa.com');
    });
  });

  it('should protect Admin routes from Residents', () => {
    // Login as resident first
    cy.visit('/login');
    cy.get('input[formControlName="email"]').type('owner@nivasa.com');
    cy.get('input[formControlName="password"]').type('Password@123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/resident/dashboard');

    // Attempt to navigate to admin
    cy.visit('/admin/dashboard');

    // Verify AuthGuard/AdminGuard redirects away from admin area
    cy.url().should('not.include', '/admin/dashboard');
    cy.url().should('include', '/resident/dashboard'); // Or another fallback page depending on guard implementation
  });

  it('should successfully log in an Admin and redirect to Admin Dashboard', () => {
    cy.visit('/login');

    // Wait for the form to render
    cy.get('input[formControlName="email"]').should('be.visible');

    cy.get('input[formControlName="email"]').type('admin@nivasa.com');
    cy.get('input[formControlName="password"]').type('Password@123'); // Assuming seeded admin password
    cy.get('button[type="submit"]').click();

    // Verify routing
    cy.url().should('include', '/admin/dashboard');
    cy.contains('Admin Dashboard').should('be.visible');

    // Check for admin specific links
    cy.contains('All Residents').should('be.visible');
  });

  it('should log out successfully', () => {
    cy.visit('/login');
    cy.get('input[formControlName="email"]').type('owner@nivasa.com');
    cy.get('input[formControlName="password"]').type('Password@123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/resident/dashboard');

    // Click logout button in sidebar
    cy.contains('Logout').click();

    // Verify local storage is cleared and redirected to login
    cy.url().should('include', '/login');
    cy.window().then((win) => {
      expect(win.localStorage.getItem('token')).to.be.null;
    });
  });
});
