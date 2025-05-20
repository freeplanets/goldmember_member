import { IsOptional, IsNumber, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CourseInfoDistancesData } from './course-info-distances.data';

export class CourseInfoHolesData {
  @ApiProperty({
    description: '',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  number?: number;

  @ApiProperty({
    description: '',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  par?: number;

  @ApiProperty({
    description: '',
    required: false,
    example: new CourseInfoDistancesData(),
  })
  @IsOptional()
  @IsObject()
  distances?: CourseInfoDistancesData = new CourseInfoDistancesData();
}
