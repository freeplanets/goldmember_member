import { IsOptional, IsString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class bookingsBodyData {
  @ApiProperty({
    description: '',
    required: false,
  })
  @IsOptional()
  @IsString()
  timeSlotId?: string;

  @ApiProperty({
    description: '',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  players?: number;
}
