import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumberString, IsString, Matches } from "class-validator";
import { PASSWORD_STYLE } from "../../utils/constant";
import { DtoErrMsg, ErrCode } from "../../utils/enumError";

export class AuthResetPasswordDto  {
    @ApiProperty({
        description: '手機號嗎',
        required: true,
        example: '0912123456',
    })
    //@IsNumberString()
    phone: string;

    @ApiProperty({
        description: '驗證碼',
        required: true,
        example: '123456',
    })
    @IsNumberString()
    verificationCode: string;

    @ApiProperty({
        description: '新密碼',
        required: true,
    })
    @IsString()
    @IsNotEmpty()
    @Matches(PASSWORD_STYLE, {message: DtoErrMsg.PASSWORD_STYLE_ERROR})
    newPassword:string;
}