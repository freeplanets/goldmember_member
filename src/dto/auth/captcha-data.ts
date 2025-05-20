import { ApiProperty } from "@nestjs/swagger";
import { ICaptchaData } from "../interface/auth.if";
import { IsString } from "class-validator";

export class CaptchaData implements ICaptchaData {
    @ApiProperty({
        description: '驗證碼',
        required: true,
        example: '1A34',
    })
    @IsString()
    captcha: string;

    @ApiProperty({
        description: '驗證碼的唯一識別碼',
        required: true,
        example: '1234567890',
    })
    @IsString()
    captchaId: string;
}