import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class usersPasswordBodyData {
  @ApiProperty({
    description: '',
    required: false,
  })
  @IsOptional()
  @IsString()
  currentPassword?: string;

  @ApiProperty({
    description: '',
    required: false,
  })
  @IsOptional()
  @IsString()
  newPassword?: string;
}
