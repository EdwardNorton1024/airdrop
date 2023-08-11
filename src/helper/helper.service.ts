import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { I_WALLET_WHITE_LIST } from 'src/interface/airdrop';

@Injectable()
export class HelperService {
  public inited = false;
  public walletWhiteList: I_WALLET_WHITE_LIST[];
  constructor() {
    this.init();
  }
  init() {
    const jsonPath = path.join(
      process.cwd(),
      'src',
      'assets',
      'wallet_white_list.json',
    );

    if (!fs.existsSync(jsonPath)) {
      throw new Error('wallet_white_list.json not exist');
    }
    const data = fs.readFileSync(jsonPath, 'utf8');
    this.walletWhiteList = JSON.parse(data);
    this.inited = true;
    return this.inited;
  }

  getWhiteListByAddresses(address: string): I_WALLET_WHITE_LIST | undefined {
    return this.walletWhiteList[address];
  }
}
