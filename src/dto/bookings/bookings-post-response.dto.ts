import { IsOptional, IsString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BookingsPostResponseDto {
  @ApiProperty({
    description: '',
    required: false,
  })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({
    description: '',
    required: false,
  })
  @IsOptional()
  @IsString()
  userId?: string;

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

  @ApiProperty({
    description: '',
    required: false,
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({
    description: '',
    required: false,
  })
  @IsOptional()
  @IsString()
  createdAt?: string;

  @ApiProperty({
    description: '',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  totalPrice?: number;
}
