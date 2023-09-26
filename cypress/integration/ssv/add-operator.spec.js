/// <reference types="cypress" />
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import config, { translations } from '~app/common/config';
import { getRandomOperatorKey } from '~lib/utils/contract/operator';
import testConfig from './config';
import { operatorKey } from './operator_keys/operatorKey';

config.CONTRACT.ADDRESS = testConfig.CONTRACT_ADDRESS;
const operatorPublicKeyLength = config.FEATURE.OPERATORS.VALID_KEY_LENGTH;

context('Add Operator', () => {
  before(() => {
    function notifyMe() {
      // Let's check if the browser supports notifications
      if (!("Notification" in window)) {
        alert("This browser does not support desktop notification");
        return
      }

      // Let's check whether notification permissions have already been granted
      if (Notification.permission === "granted") {
        console.log('permission was granted before')
        // If it's okay let's create a notification
        new Notification("Permission was granted before");
        return
      }

      // Otherwise, we need to ask the user for permission
      if (Notification.permission !== "denied") {
        console.log('need to ask for permission')
        Notification.requestPermission().then(function (permission) {
          console.log('permission requested, the user says'. permission)
          // If the user accepts, let's create a notification
          if (permission === "granted") {
            console.log('permission granted, showing hi')
            console.log(Notification)
            new Notification("Hi there!");
          }
        });

        return
      }

      // At last, if the user has denied notifications, and you
      // want to be respectful there is no need to bother them any more.
      console.log('Permission was denied before')
    }
    notifyMe()

    cy.visit(Cypress.config('baseUrl'));
  });

  it('should navigate to operator screen', () => {
    cy.get(`[data-testid="${config.routes.OPERATOR.HOME}"]`).click();

    cy.get('[data-testid=header-title]')
      .should('contain.text', translations.OPERATOR.HOME.TITLE);

    cy.location().should((location) => {
      expect(location.hash).to.be.empty;
      expect(location.href).to.eq(`${Cypress.config('baseUrl')}${config.routes.OPERATOR.HOME}`);
      expect(location.pathname).to.eq(config.routes.OPERATOR.HOME);
      expect(location.search).to.be.empty;
    });
  });

  it('should navigate to register new operator screen', () => {
    const registerOperatorSelector = `[data-testid="${config.routes.OPERATOR.GENERATE_KEYS}"]`;
    cy.waitFor(registerOperatorSelector);
    cy.get(registerOperatorSelector).click();

    cy.get('[data-testid=header-title]')
      .should('contain.text', translations.OPERATOR.REGISTER.TITLE);

    cy.location().should((location) => {
      expect(location.hash).to.be.empty;
      expect(location.href).to.eq(`${Cypress.config('baseUrl')}${config.routes.OPERATOR.GENERATE_KEYS}`);
      expect(location.pathname).to.eq(config.routes.OPERATOR.GENERATE_KEYS);
      expect(location.search).to.be.empty;
    });
  });

  it('should display wrong operator key error', () => {
    // Wrong display name
    const operatorName = 'TestOperator: 123';
    cy.get('[data-testid=new-operator-name]').clear().type(`${operatorName}`);
    cy.get('[data-testid=new-operator-name]').blur();
    cy.get('[data-testid="register-operator-button"]').should('be.disabled');
    cy.get('[data-testid=new-operator-name]').parent().should('contain.text', 'Display name should contain only alphanumeric characters.');
  });

  it('should display empty operator name error', () => {
    cy.get('[data-testid=new-operator-name]').clear();
    cy.get('[data-testid=new-operator-name]').focus();
    cy.get('[data-testid=new-operator-name]').blur();
    cy.get('[data-testid="register-operator-button"]').should('be.disabled');
    cy.get('[data-testid=new-operator-name]').parent().should('contain.text', 'Please enter a display name.');
  });

  it('should display empty operator key error', () => {
    cy.get('[data-testid=new-operator-name]').clear().type('TestOperator');
    cy.get('[data-testid=new-operator-name]').blur();
    cy.get('[data-testid=new-operator-key]').clear();
    cy.get('[data-testid=new-operator-key]').focus();
    cy.get('[data-testid=new-operator-key]').blur();
    cy.get('[data-testid="register-operator-button"]').should('be.disabled');
    cy.get('[data-testid=new-operator-key]').parent().should('contain.text', 'Please enter an operator key.');
  });

   it('should fill up operator data without errors', () => {
    cy.get('[data-testid=new-operator-name]').clear().type('TestOperator');
    cy.get('[data-testid=new-operator-name]').blur();
    cy.get('[data-testid=new-operator-key]').clear().type(getRandomOperatorKey(false, false));
    cy.get('[data-testid=new-operator-key]').blur();
    cy.get('[data-testid="register-operator-button"]').should('be.enabled');
    });

    it('should show error about wrong operator public key format', () => {
    cy.get('[data-testid=new-operator-name]').clear().type('TestOperator');
    cy.get('[data-testid=new-operator-name]').blur();
    cy.get('[data-testid=new-operator-key]').clear().type(getRandomOperatorKey(false, true));
    cy.get('[data-testid=new-operator-key]').blur();
    cy.get('[data-testid="register-operator-button"]').should('be.disabled');
    cy.get('[data-testid=new-operator-key]').parent().should('contain.text', 'Invalid operator key - see our documentation to generate your key.');
    });

    it('should create operator', () => {
      cy.get('[data-testid=new-operator-name]').clear().type('TestOperator');
      cy.get('[data-testid=new-operator-key]').clear().type(operatorKey);
      cy.get('[data-testid=new-operator-key]').blur();
      cy.get('[data-testid="register-operator-button"]').should('be.enabled');
      cy.get('[data-testid="register-operator-button"]').click();
      cy.wait(600);
      cy.get('[data-testid="terms-and-conditions-checkbox"]').click();
      cy.get('[data-testid="submit-operator"]').click();
      cy.wait(600);
      cy.location().should((location) => {
        expect(location.hash).to.be.empty;
        expect(location.href).to.eq(`${Cypress.config('baseUrl')}${config.routes.OPERATOR.SUCCESS_PAGE}`);
        expect(location.pathname).to.eq(config.routes.OPERATOR.SUCCESS_PAGE);
        expect(location.search).to.be.empty;
      });
      cy.get('[data-testid="success-image"]').should('be.visible');
    });

    it('should show error about existing operator public key', () => {
      // Enter existing operator key
      cy.visit(Cypress.config('baseUrl'));
      cy.get(`[data-testid="${config.routes.OPERATOR.HOME}"]`).click();
      const registerOperatorSelector = `[data-testid="${config.routes.OPERATOR.GENERATE_KEYS}"]`;
      cy.waitFor(registerOperatorSelector);
      cy.get(registerOperatorSelector).click();
      cy.get('[data-testid=new-operator-name]').clear().type('TestOperator');
      cy.get('[data-testid=new-operator-name]').blur();
      cy.get('[data-testid=new-operator-key]').clear().type(getRandomOperatorKey(true, false));
      cy.get('[data-testid=new-operator-key]').blur();
      cy.get('[data-testid="register-operator-button"]').should('be.enabled');
      cy.get('[data-testid="register-operator-button"]').click();
      cy.get('.MuiAlert-message').should('contain.text', 'Operator already exists');
    });
});
