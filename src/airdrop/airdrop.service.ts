import { Injectable } from '@nestjs/common';
import { I_WALLET_WHITE_LIST } from 'src/interface/airdrop';
import { hex2string } from '../utils/index';
import { RPCNodeClient } from '../utils/rpc_node_client';

@Injectable()
export class AirdropService {
  private rpcNodeClient: RPCNodeClient;
  constructor() {
    this.rpcNodeClient = new RPCNodeClient(
      // 'http://bde_team:nfg_9527@192.168.8.4:8332',
      'https://btc.getblock.io/05e9e38d-2d3a-4cfd-947a-4de92c461e6a/mainnet/',
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
    let res;
    try {
      res = await this.rpcNodeClient.entryByTxid(txid);
    } catch (err) {
      return err;
    }
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
          const charset = mime_type
            ?.split(';')
            ?.filter((e) => e.startsWith('charset='))[0]
            ?.split(';')[1] as BufferEncoding | undefined;
          res_content = hex2string(content, charset);
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
