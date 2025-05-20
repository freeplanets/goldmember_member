import { IsOptional, IsString, Matches } from 'class-validator';
import { ApiOperation, ApiProperty, ApiPropertyOptions } from '@nestjs/swagger';
import { PHONE_OR_EXTENSION_STYLE, UUID_V1_STYLE, UUID_V4_STYLE } from '../../utils/constant';
import { DtoErrMsg } from '../../utils/enumError';

export class CouponsTransferRequestDto {
  @ApiProperty({
    description: '優惠券代號',
    required: true,
  })
  @IsOptional()
  @IsString()
  @Matches(UUID_V4_STYLE, {message: DtoErrMsg.ID_STYLE_ERROR},)
  couponId?: string;

  @ApiProperty({
    description: '受贈者代號',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Matches(UUID_V1_STYLE, {message: DtoErrMsg.ID_STYLE_ERROR})
  targetUserId?: string;

  @ApiProperty({
    description: '受贈者手機號碼',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Matches(PHONE_OR_EXTENSION_STYLE, {message: DtoErrMsg.PHONE_STYLE_ERROR})
  targetPhone:string;
}
