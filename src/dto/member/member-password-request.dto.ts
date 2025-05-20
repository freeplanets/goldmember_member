import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PASSWORD_STYLE } from '../../utils/constant';
import { DtoErrMsg } from '../../utils/enumError';

export class MemberPasswordRequestDto {
  @ApiProperty({
    description: '原始密碼',
    required: true,
  })
  @IsString()
  currentPassword?: string;

  @ApiProperty({
    description: '新密碼',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @Matches(PASSWORD_STYLE, { message: DtoErrMsg.PASSWORD_STYLE_ERROR })
  newPassword: string;
}
