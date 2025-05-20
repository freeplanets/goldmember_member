import { IsEmpty, IsNumber, IsNumberString, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IMember } from '../interface/member.if';
import { FileUploadDto } from '../common/file-upload.dto';
import { PHONE_STYLE } from '../../utils/constant';
import { DtoErrMsg } from '../../utils/enumError';
import { GENDER } from '../../utils/enum';

export class MemberPutProfileRequestDto extends FileUploadDto implements Partial<IMember> {
  @ApiProperty({
    description: '會員名稱',
    required: false,
    example: '王大明'
  })
  name?: string;
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
    description: '電子郵件',
    required: false,
    example: 'example@email.com',
  })
  email?: string;

  @ApiProperty({
    description: '手機號碼',
    required: false,
    example: '0912123456'
  })
  // @IsOptional()
  // @IsString()
  // @Matches(PHONE_STYLE, { message: DtoErrMsg.PHONE_STYLE_ERROR})
  phone?: string;

  @ApiProperty({
    description: '生日',
    required: false,
    example: '1934/01/01'
  })
  birthDate?: string;

  @ApiProperty({
    description: '地址',
    required: false,
    example: '新北市蘆洲區中山一路XX號'
  })
  address?: string;

  @ApiProperty({
    description: '差點',
    required: false,
    example: 56
  })
  //@IsNumberString()
  handicap?: number;

  @ApiProperty({
    description: '圖片名稱',
    required: false,
    example: 'happy',
  })
  pic?: string;

  @ApiProperty({
    description: '公告已讀時間戳',
    required: false,
    example: Date.now(),
  })
  announcementReadTs?: number;

  @ApiProperty({
    description: '認證碼(修改手機號時為必填)',
    example: '123456',
    required: false,
  })
  //@IsNumberString()
  verificationCode?: string;  
}
