import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class couponsBodyData {
  @ApiProperty({
    description: '',
    required: false,
  })
  @IsOptional()
  @IsString()
  couponId?: string;

  @ApiProperty({
    description: '',
    required: false,
  })
  @IsOptional()
  @IsString()
  bookingId?: string;
}
