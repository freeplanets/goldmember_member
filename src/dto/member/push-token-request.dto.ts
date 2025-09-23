import { ApiProperty } from '@nestjs/swagger';
import { IPushToken } from '../interface/member.if';
import { IsString } from 'class-validator';

export class PushTokenReqDto implements Partial<IPushToken> {
    // @ApiProperty({
    //     description: '會員ID',
    //     required: true,
    // })
    // @IsString()
    // userId: string;

    @ApiProperty({
        description: '',
        required: true,
    })
    expoPushToken?: string;

    @ApiProperty({
        description: '',
        required: true,
    })
    nativePushToken?: string;

    @ApiProperty({
        description: '使用設備的OS平台',
        required: true,
    })
    platform?: string;

    @ApiProperty({
        description: '設備ID',
        required: true,
    })
    deviceId?: string;

}