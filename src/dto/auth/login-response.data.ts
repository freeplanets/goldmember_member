import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ILoginResponse } from '../interface/auth.if';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { RefreshTokenData } from './refresh-token-data';

export class LoginResponseData extends RefreshTokenData implements ILoginResponse {
  // private jwt = new JwtService();
  constructor(tokenObj:any = undefined, jwt:JwtService | undefined = undefined, deviceObj:any = undefined,){
    super(tokenObj, jwt);
    console.log('object:', {...deviceObj})
    if (deviceObj) {
      const optD:JwtSignOptions = {
        secret: process.env.DEVICE_KEY,
        expiresIn: '90d' // 3 months
      }
      if (deviceObj) this.deviceRefreshToken = jwt.sign({...deviceObj}, optD);
      console.log("jwt check2");
    }
    // delete this.jwt;
  }
  @ApiProperty({
    description: 'device Resresh Token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkZWl2Y2VCcmFuZCI6IkFwcGxlIiwiZGV2aWNlTW9kZWwiOiJpUGhvbmUiLCJkZXZpY2VOYW1lIjoiQXBwbGUgaVBob25lIFNhZmFyaSIsImRldmljZUlkIjoiMWRjYTMxNTktNDY1YS00OGRlLWIyNDgtOTcwNmUxNzY2MDAxIiwic3lzdGVtTmFtZSI6IlNhZmFyaSIsInN5c3RlbVZlcnNpb24iOiIxNi42IiwiaWF0IjoxNzQ1ODA1MDEwfQ.x2JGeaVAGmqsYIDiTQVRcnF_FFqYrafjIG_AM8kFngY',
  })
  deviceRefreshToken?: string;
}
