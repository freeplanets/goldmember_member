import { IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CommonResponseDto } from '../common/common-response.dto';
import { ICommonResponse } from '../interface/common.if';
import { LoginResponseData } from './login-response.data';

export class AuthResponseDto extends CommonResponseDto implements ICommonResponse<LoginResponseData> {
  @ApiProperty({
    description: 'token',
    required: true,
    type: LoginResponseData,
  })
  @IsObject()
  data?: LoginResponseData;
}
