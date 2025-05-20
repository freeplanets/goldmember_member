import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CouponsPostRequestDto {
  @ApiProperty({
    description: '優惠券代號',
    required: false,
  })
  @IsOptional()
  @IsString()
  couponId?: string;

  // @ApiProperty({
  //   description: '預約代號',
  //   required: false,
  // })
  // @IsOptional()
  // @IsString()
  // bookingId?: string;
}
