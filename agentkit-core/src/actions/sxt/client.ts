import { SpaceAndTime } from "sxt-nodejs-sdk";
import { SXTConfig, validateSXTConfig } from "./config";
import { SXTResponse } from "./types";

export class SXTClient {
  private sxt: SpaceAndTime;
  private config: SXTConfig;

  constructor(config: Partial<SXTConfig> = {}) {
    this.config = validateSXTConfig(config);
    this.sxt = new SpaceAndTime();
  }

  async authenticate(): Promise<void> {
    const auth = this.sxt.Authentication();
    await auth.GenerateToken(
      this.config.userId,
      this.config.authCode,
      this.config.signature,
      this.config.publicKey,
    );
  }

  async executeQuery(sql: string): Promise<SXTResponse> {
    const sqlAPI = this.sxt.SqlAPI();
    return (await sqlAPI.DQL(sql, [], [])) as SXTResponse;
  }

  async refreshToken(): Promise<void> {
    const auth = this.sxt.Authentication();
    await auth.RefreshToken();
  }

  async validateToken(): Promise<boolean> {
    const auth = this.sxt.Authentication();
    const response = await auth.ValidateToken();
    return !!response;
  }

  async logout(): Promise<void> {
    const auth = this.sxt.Authentication();
    await auth.Logout();
  }

  async checkUser(userId: string): Promise<boolean> {
    const auth = this.sxt.Authentication();
    const response = await auth.CheckUser(userId);
    return !!response;
  }
}
