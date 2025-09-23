import { Module } from '@nestjs/common';
import { AuthController } from '../controller/auth.controller';
import { AuthService } from '../service/auth.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import jwtConfig from '../config/jwt.config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { Member, MemberSchema } from '../dto/schemas/member.schema';
import { TempData, TempDataSchema } from '../dto/schemas/tempdata.schema';
import { LoginToken, LoginTokenSchema } from '../dto/schemas/login-token.schema';
import { MemberActivity, MemberActivitySchema } from '../dto/schemas/member-activity.schema';
import { MemberGrowth, MemberGrowthSchema } from '../dto/schemas/member-growth.schema';
    
@Module({
  imports: [
    ConfigModule.forRoot({
      load: [jwtConfig],
    }),
    JwtModule.registerAsync({
      imports:[ConfigModule],
      inject:[ConfigService],
      useFactory: (configService:ConfigService) => ({
        secret: configService.get<string>('secret.jwt'),
        signOptions: {
          mutatePayload: true,
          expiresIn: process.env.IS_OFFLINE ? '1h' : '5m' ,
        }
      }),
    }),
    MongooseModule.forFeature([
      {name: Member.name, schema: MemberSchema},
      {name: TempData.name, schema: TempDataSchema},
      {name: LoginToken.name, schema: LoginTokenSchema},
      {name: MemberActivity.name, schema: MemberActivitySchema},
      {name: MemberGrowth.name, schema: MemberGrowthSchema},
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
