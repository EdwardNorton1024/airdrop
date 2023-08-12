import axios from 'axios';
import { sequential } from './index';

export class RPCNodeClient {
  private baseUrl: string;
  static RPCPostParams = { jsonrpc: '1.0', id: '1' };
  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }
  async run_ajax(method: string, params: any[]) {
    console.log('rpc method :', method);
    const _params = {
      ...RPCNodeClient.RPCPostParams,
      method,
      params,
    };
    console.log('rpc params :', _params);
    console.log('-------------------');
    return axios.post(this.baseUrl, _params).then((res) => {
      return res.data;
    });
  }
  async entryByTxid(txid: string) {
    return sequential(
      this,
      [this.getrawtransaction, this.decoderawtransaction, this.decodescript],
      txid,
    );
  }

  async getrawtransaction(txid: string) {
    return this.run_ajax('getrawtransaction', [txid]);
  }
  async decoderawtransaction({ result }) {
    if (!result) {
      return Promise.reject('result is empyt');
    }
    return this.run_ajax('decoderawtransaction', [result]);
  }
  async decodescript(res: any) {
    if (res.err) {
      return Promise.reject(res.err);
    }
    const { result } = res;
    const txinwitness = result?.vin[0]?.txinwitness[1];
    return this.run_ajax('decodescript', [txinwitness]);
  }
}
