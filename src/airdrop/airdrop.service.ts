import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { I_WALLET_WHITE_LIST } from 'src/interface/airdrop';
import { hex2string, sequential } from '../utils/index';

@Injectable()
export class AirdropService {
  private rpcNodeClient: RPCNodeClient;
  constructor() {
    this.rpcNodeClient = new RPCNodeClient(
      'http://bde_team:nfg_9527@192.168.8.4:8332',
    );
  }
  // # 白名单版本（因为白名单不全暂时废弃）
  getAirdropInfoByWhiteList(whiteList: I_WALLET_WHITE_LIST | undefined) {
    if (!whiteList) {
      return {
        inscriptions_count: 0,
        collections: {},
      };
    }
    return whiteList;
  }
  // # 三方api接口版本
  async getAirdropInfobyApi(address: string) {
    // try {
    //   const res = await fetch(
    //     `https://api.hiro.so/ordinals/v1/inscriptions?address=${address}`,
    //   ).then((res) => res.json());
    //   return res;
    // } catch (err) {
    //   return address;
    // }
    try {
      const res = await fetch(
        `https://turbo.ordinalswallet.com/wallet/${address}`,
      ).then((res) => res.json());
      return res;
    } catch (err) {
      return address;
    }
  }

  async getAirdropInfobyRPCNode(txid: string) {
    const res = await this.rpcNodeClient.entryByTxid(txid);
    if (res?.result?.asm) {
      const asm: string = res.result.asm;
      const asm_list = asm.split(' ');
      const ord_index = asm_list.indexOf('6582895');
      if (
        ord_index > 0 &&
        asm_list[ord_index - 1] === 'OP_IF' &&
        asm_list[ord_index + 1] === '1'
      ) {
        const mime_type = hex2string(asm_list[ord_index + 2]);
        const id = txid + 'i0';
        const base_header = `data:${mime_type};base64,`;
        let content = '';
        let res_content = '';
        asm_list
          .slice(ord_index + 4, asm_list.indexOf('OP_ENDIF'))
          .forEach((item) => {
            content += item;
          });

        if (mime_type.startsWith('text/plain')) {
          res_content = content;
        } else {
          res_content = base_header + btoa(hex2string(content));
        }

        return {
          type: mime_type,
          content: res_content,
          id,
          preview: 'https://ordinals.com/inscription/' + id,
          img: 'https://ordinals.com/content/' + id,
        };
      }
    }
    return {
      err: 'not found',
    };
  }
}

class RPCNodeClient {
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
