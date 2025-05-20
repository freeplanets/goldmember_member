import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumberString, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { PHONE_STYLE } from '../../utils/constant';
import { DtoErrMsg } from '../../utils/enumError';
import { SmsCodeUsage } from '../../utils/enum';

export class AuthSMSRequestDto {
    @ApiProperty({
        description: '手機號嗎',
        required: true,
        example: '0912123456',
    })
    @IsString()
    @Matches(PHONE_STYLE, { message: DtoErrMsg.PHONE_STYLE_ERROR })
    phone: string;

    @ApiProperty({
        description: '圖形驗證碼ID',
        required: true,
        example: '1234567890',
    })
    @IsString()
    captchaId: string;

    @ApiProperty({
    description: '圖形認證碼',
    required: true,
    example: '1A34',
    })
    @IsString()
    captchaCode: string;
   
    @ApiProperty({
        description: '認證碼用途',
        enum: SmsCodeUsage,
        example: SmsCodeUsage.REGISTER,
        required: true,
    })
    @IsString()
    @IsNotEmpty()
    codeUsage:SmsCodeUsage;
}