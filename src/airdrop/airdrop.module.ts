import { Module } from '@nestjs/common';
import { AirdropService } from './airdrop.service';
import { AirdropController } from './airdrop.controller';
import { HelperService } from '../helper/helper.service';
@Module({
  controllers: [AirdropController],
  providers: [AirdropService, HelperService],
})
export class AirdropModule {}
