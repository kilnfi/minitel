import { ApiPromise, WsProvider } from "@polkadot/api";
import type { Registry } from "@polkadot/types-codec/types";

export class SubstrateWsClient {
  private wsClient: ApiPromise;

  get client(): ApiPromise {
    return this.wsClient;
  }

  get isConnected(): boolean {
    return this.wsClient.isConnected;
  }

  get registry(): Registry {
    return this.wsClient.registry;
  }

  constructor(token: string) {
    this.wsClient = new ApiPromise({
      provider: new WsProvider(token),
    });
  }

  async connect(): Promise<void> {
    if (!this.isConnected) {
      await this.wsClient.isReady;
    }
  }
}
