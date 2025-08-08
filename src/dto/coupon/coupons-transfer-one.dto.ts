import { IsOptional, IsString, Matches } from 'class-validator';
import { ApiOperation, ApiProperty, ApiPropertyOptions } from '@nestjs/swagger';
import { PHONE_OR_EXTENSION_STYLE, UUID_V1_STYLE, UUID_V4_STYLE } from '../../utils/constant';
import { DtoErrMsg } from '../../utils/enumError';

export class CouponsTransferOneDto {
  @ApiProperty({
    description: '優惠券代號',
    required: true,
    example: 'cf00e791-6ddb-4f91-aacc-0e3f4a2f86d1',
  })
  @Matches(UUID_V4_STYLE, {message: DtoErrMsg.ID_STYLE_ERROR},)
  couponId?: string;

  @ApiProperty({
    description: '受贈者代號',
    required: false,
    example: '7aba6430-2709-11f0-9f40-3d973b598373',
  })
  @IsOptional()
  @IsString()
  @Matches(UUID_V1_STYLE, {message: DtoErrMsg.ID_STYLE_ERROR})
  targetUserId?: string;

  @ApiProperty({
    description: '受贈者手機號碼',
    required: false,
    example: '0912345678'
  })
  @IsOptional()
  @IsString()
  @Matches(PHONE_OR_EXTENSION_STYLE, {message: DtoErrMsg.PHONE_STYLE_ERROR})
  targetPhone:string;
}
