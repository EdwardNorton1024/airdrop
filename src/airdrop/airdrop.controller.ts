import { Controller, Get, Param, Query } from '@nestjs/common';
import { AirdropService } from './airdrop.service';
import { HelperService } from '../helper/helper.service';

@Controller('airdrop')
export class AirdropController {
  constructor(
    private readonly airdropService: AirdropService,
    private readonly helperService: HelperService,
  ) {}
  // @Get()
  // getAirdropInfobyApi(@Query('address') address: string) {
  //   console.log('address: ', address);
  //   return this.airdropService.getAirdropInfobyApi(address);
  // }
  @Get()
  getAirdropInfobyRPCNode(@Query('txid') txid: string) {
    return this.airdropService.getAirdropInfobyRPCNode(txid);
  }
  @Get(':address')
  getAirdropInfoByWhiteList(@Param('address') address: string) {
    const whiteList = this.helperService.getWhiteListByAddresses(address);
    return this.airdropService.getAirdropInfoByWhiteList(whiteList);
  }
}
