import { Module } from '@nestjs/common';
import { MemberController } from '../controller/member.controller';
import { MemberService } from '../service/member.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Member, MemberSchema } from '../dto/schemas/member.schema';
import { JwtModule } from '@nestjs/jwt';
import { TempData, TempDataSchema } from '../dto/schemas/tempdata.schema';
import { LoginToken, LoginTokenSchema } from '../dto/schemas/login-token.schema';
import { KsMember, KsMemberSchema } from '../dto/schemas/ksmember.schema';
import { MemberGrowth, MemberGrowthSchema } from '../dto/schemas/member-growth.schema';
import { MemberTransferLog, MemberTransferLogSchema } from '../dto/schemas/member-transfer-log.schema';
import { Coupon, CouponSchema } from '../dto/schemas/coupon.schema';
import { InvitationCode, InvitationCodeSchema } from '../dto/schemas/invitation-code.schema';
import { PushToken, PushTokenSchema } from '../dto/schemas/push-token.schema';

@Module({
  imports: [
    JwtModule,
    MongooseModule.forFeature(
      [
        {name:Member.name, schema:MemberSchema},
        {name:TempData.name, schema:TempDataSchema},
        {name: LoginToken.name, schema: LoginTokenSchema},
        {name:KsMember.name, schema:KsMemberSchema},
        {name:MemberGrowth.name, schema:MemberGrowthSchema},
        {name:MemberTransferLog.name, schema:MemberTransferLogSchema},
        {name:Coupon.name, schema: CouponSchema},
        {name:InvitationCode.name, schema: InvitationCodeSchema},
        {name:PushToken.name, schema:PushTokenSchema},
      ],
    ),
  ],
  controllers: [MemberController],
  providers: [MemberService],
})
export class MemberModule {}
