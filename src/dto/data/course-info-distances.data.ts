import { IsOptional, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CourseInfoDistancesData {
  @ApiProperty({
    description: '',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  blue?: number;

  @ApiProperty({
    description: '',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  white?: number;

  @ApiProperty({
    description: '',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  red?: number;
}
