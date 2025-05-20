import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IMember } from '../interface/member.if';
import { FileUploadDto } from '../common/file-upload.dto';
import { PASSWORD_STYLE } from '../../utils/constant';
import { DtoErrMsg, ErrCode } from '../../utils/enumError';
import { GENDER } from '../../utils/enum';

export class MemberCreateRequestDto extends FileUploadDto implements Partial<IMember> {
  @ApiProperty({
    description: '會員名稱',
    required: true,
    example: '王大明'
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: '䁥稱',
    required: false,
    example: '小明',
  })
  displayName?: string;

  @ApiProperty({
    description: '性別(0:法人, 1:男, 2:女)',
    required: false,
    enum: GENDER,
    example: GENDER.MALE,
  })
  gender?: GENDER;

  @ApiProperty({
    description: '會員密碼',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @Matches(PASSWORD_STYLE, {message: DtoErrMsg.PASSWORD_STYLE_ERROR})
  password: string;

  @ApiProperty({
    description: '電子郵件',
    required: false,
    example: 'example@email.com',
  })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({
    description: '手機號碼',
    required: true,
    example: '0912123456'
  })
  phone: string;

  @ApiProperty({
    description: '生日',
    required: false,
    example: '1934/01/01'
  })
  @IsOptional()
  @IsString()
  birthDate?: string;

  @ApiProperty({
    description: '地址',
    required: false,
    example: '新北市蘆洲區中山一路XX號'
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({
    description: '差點',
    required: false,
    example: 56
  })
  // @IsOptional()
  // @IsNumber()
  handicap?: number;

  @ApiProperty({
    description: '圖片名稱',
    required: false,
    example: 'happy',
  })
  @IsOptional()
  @IsString()
  pic?: string;
}
