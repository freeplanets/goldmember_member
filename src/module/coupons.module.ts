import { Module } from '@nestjs/common';
import { CouponsController } from '../controller/coupons.controller';
import { CouponsService } from '../service/coupons.service';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { Coupon, CouponSchema } from '../dto/schemas/coupon.schema';
import { Member, MemberSchema } from '../dto/schemas/member.schema';
import { LoginToken, LoginTokenSchema } from '../dto/schemas/login-token.schema';
import { CouponTransferLog, CouponTransferLogSchema } from '../dto/schemas/coupon-transfer-log.schema';

@Module({
  imports: [
    JwtModule,
    MongooseModule.forFeature([
      {name:Coupon.name, schema:CouponSchema},
      {name:Member.name, schema:MemberSchema},
      {name:LoginToken.name, schema:LoginTokenSchema},
      {name:CouponTransferLog.name, schema:CouponTransferLogSchema},
    ]),
  ],
  controllers: [CouponsController],
  providers: [CouponsService],
})
export class CouponsModule {}
