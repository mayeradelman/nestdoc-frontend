import {
  CognitoUserPool,
  CognitoUser,
  CognitoUserAttribute,
  AuthenticationDetails,
  CognitoUserSession,
} from "amazon-cognito-identity-js";

interface CognitoConfig {
  region: string;
  userPoolId: string;
  clientId: string;
}

export class CognitoUtility {
  private userPool: CognitoUserPool;

  constructor(private config: CognitoConfig) {
    this.userPool = new CognitoUserPool({
      UserPoolId: this.config.userPoolId,
      ClientId: this.config.clientId,
    });
  }

  /**
   * Sign up a new user
   */
  async signUp(
    username: string,
    password: string,
    email: string
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const attributes = [
        new CognitoUserAttribute({ Name: "email", Value: email }),
      ];

      this.userPool.signUp(username, password, attributes, [], (err, result) => {
        if (err) {
          return reject(err.message || JSON.stringify(err));
        }
        resolve(result?.user.getUsername() || "");
      });
    });
  }

  /**
   * Confirm a user's signup
   */
  async confirmSignUp(username: string, code: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const user = new CognitoUser({
        Username: username,
        Pool: this.userPool,
      });

      user.confirmRegistration(code, true, (err, result) => {
        if (err) {
          return reject(err.message || JSON.stringify(err));
        }
        resolve();
      });
    });
  }

  /**
   * Sign in an existing user
   */
  async signIn(username: string, password: string): Promise<CognitoUserSession> {
    return new Promise((resolve, reject) => {
      const user = new CognitoUser({
        Username: username,
        Pool: this.userPool,
      });

      const authDetails = new AuthenticationDetails({
        Username: username,
        Password: password,
      });

      user.authenticateUser(authDetails, {
        onSuccess: (session) => resolve(session),
        onFailure: (err) => reject(err.message || JSON.stringify(err)),
      });
    });
  }

  /**
   * Resend confirmation code
   */
  async resendConfirmationCode(username: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const user = new CognitoUser({
        Username: username,
        Pool: this.userPool,
      });

      user.resendConfirmationCode((err) => {
        if (err) {
          return reject(err.message || JSON.stringify(err));
        }
        resolve();
      });
    });
  }

  /**
   * Forgot password
   */
  async forgotPassword(username: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const user = new CognitoUser({
        Username: username,
        Pool: this.userPool,
      });

      user.forgotPassword({
        onSuccess: () => resolve(),
        onFailure: (err) => reject(err.message || JSON.stringify(err)),
      });
    });
  }

  /**
   * Confirm password reset
   */
  async confirmPassword(
    username: string,
    confirmationCode: string,
    newPassword: string
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const user = new CognitoUser({
        Username: username,
        Pool: this.userPool,
      });

      user.confirmPassword(confirmationCode, newPassword, {
        onSuccess: () => resolve(),
        onFailure: (err) => reject(err.message || JSON.stringify(err)),
      });
    });
  }

  /**
   * Sign out the currently signed-in user
   */
  signOut(username: string): void {
    const user = new CognitoUser({
      Username: username,
      Pool: this.userPool,
    });
    user.signOut();
  }
}