import { ApiPromise, WsProvider } from '@polkadot/api';

export class SubstrateWsClient {
  public client: ApiPromise | null = null;
  public isConnected = false;
  private rpcUrl: string;

  constructor(rpcUrl: string) {
    this.rpcUrl = rpcUrl;
  }

  async connect(): Promise<void> {
    try {
      const wsProvider = new WsProvider(this.rpcUrl);
      this.client = await ApiPromise.create({ provider: wsProvider });
      this.isConnected = true;
    } catch (error) {
      console.error('Failed to connect to Substrate RPC:', error);
      this.isConnected = false;
      throw new Error('Failed to connect to Substrate RPC');
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.disconnect();
      this.isConnected = false;
      this.client = null;
    }
  }
}
