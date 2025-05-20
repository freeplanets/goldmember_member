import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class authBodyData {
  @ApiProperty({
    description: '',
    required: false,
  })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({
    description: '',
    required: false,
  })
  @IsOptional()
  @IsString()
  password?: string;
}
