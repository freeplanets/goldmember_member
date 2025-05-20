import { Module } from '@nestjs/common';
import { MemberController } from '../controller/member.controller';
import { MemberService } from '../service/member.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Member, MemberSchema } from '../dto/schemas/member.schema';
import { JwtModule } from '@nestjs/jwt';
import { TempData, TempDataSchema } from '../dto/schemas/tempdata.schema';
import { LoginToken, LoginTokenSchema } from '../dto/schemas/login-token.schema';

@Module({
  imports: [
    JwtModule,
    MongooseModule.forFeature(
      [
        {name:Member.name, schema:MemberSchema},
        {name:TempData.name, schema:TempDataSchema},
        {name: LoginToken.name, schema: LoginTokenSchema},
      ],
    ),
  ],
  controllers: [MemberController],
  providers: [MemberService],
})
export class MemberModule {}
