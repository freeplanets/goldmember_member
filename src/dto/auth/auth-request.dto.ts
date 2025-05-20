import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IMember } from '../interface/member.if';
import { PHONE_STYLE } from '../../utils/constant';
import { DtoErrMsg } from '../../utils/enumError';
import { LoginDevice } from '../devices/login-device';
// import { JwtService } from '@nestjs/jwt';

// const mdvc:Partial<IMemberDevice> = {
//   deivceBrand: 'Apple',
//   deviceModel: 'iPhone',
//   deviceName: 'Apple iPhone Safari',
//   deviceId: '1dca3159-465a-48de-b248-9706e1766001',
//   systemName: 'Safari',
//   systemVersion: '16.6',
// }
// const token = new JwtService().sign(mdvc, {secret: process.env.DEVICE_KEY});
export class AuthRequestDto implements Partial<IMember> {
  @ApiProperty({
    description: '電話號碼',
    required: true,
  })
  @IsString()
  @Matches(PHONE_STYLE, { message: DtoErrMsg.PHONE_STYLE_ERROR })
  phone: string;

  @ApiProperty({
    description: '密碼',
    required: true,
  })
  @IsString()
  password: string;

  @ApiProperty({
    description: '會員登入設備資訊(jwt token)',
    required: true,
    type: LoginDevice,
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkZWl2Y2VCcmFuZCI6IkFwcGxlIiwiZGV2aWNlTW9kZWwiOiJpUGhvbmUiLCJkZXZpY2VOYW1lIjoiQXBwbGUgaVBob25lIFNhZmFyaSIsImRldmljZUlkIjoiMWRjYTMxNTktNDY1YS00OGRlLWIyNDgtOTcwNmUxNzY2MDAxIiwic3lzdGVtTmFtZSI6IlNhZmFyaSIsInN5c3RlbVZlcnNpb24iOiIxNi42IiwiaWF0IjoxNzQ1ODA1MDEwfQ.x2JGeaVAGmqsYIDiTQVRcnF_FFqYrafjIG_AM8kFngY',
  })
  @IsNotEmpty()
  @IsString()
  fingerprint:string;
}
