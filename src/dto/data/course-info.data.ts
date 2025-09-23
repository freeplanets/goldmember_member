import { IsOptional, IsString, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CourseInfoHolesData } from './course-info-holes.data';

export class CourseInfoData {
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
    example: [new CourseInfoHolesData()],
    type: CourseInfoHolesData,
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  holes?: CourseInfoHolesData[] = [new CourseInfoHolesData()];
}
