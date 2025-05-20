import { IsOptional, IsString, IsNumber, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TimeSlotData {
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
  startTime?: string;

  @ApiProperty({
    description: '',
    required: false,
  })
  @IsOptional()
  @IsString()
  endTime?: string;

  @ApiProperty({
    description: '',
    required: false,
  })
  @IsOptional()
  @IsString()
  area?: string;

  @ApiProperty({
    description: '',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  price?: number;

  @ApiProperty({
    description: '',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  available?: boolean;

  @ApiProperty({
    description: '',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isHoliday?: boolean;

  @ApiProperty({
    description: '',
    required: false,
  })
  @IsOptional()
  @IsString()
  courseType?: string;

  @ApiProperty({
    description: '',
    required: false,
  })
  @IsOptional()
  @IsString()
  combination?: string;
}
