import { ApiProperty } from '@nestjs/swagger';
import { IMember } from '../interface/member.if';
import { DS_LEVEL, GENDER, MEMBER_LEVEL } from '../../utils/enum';

export class MemberDetailInfo implements Partial<IMember> {
    @ApiProperty({
        description: '會員名稱',
        required: false,
        example: '王大明',
    })
    name?: string;

    @ApiProperty({
        description: '會員暱稱',
    })
    displayName?: string;

    @ApiProperty({
        description: '性別(0:法人, 1:男, 2:女)',
        enum: GENDER,
        example: GENDER.MALE,
    })
    gender?: GENDER;


    @ApiProperty({
        description: '會員型態',
        enum: MEMBER_LEVEL,
        example: MEMBER_LEVEL.GENERAL_MEMBER,
    })
    membershipType?: MEMBER_LEVEL;  //


    @ApiProperty({
        description: '電子郵件',
        required: false,
        example: 'example@email.com',
    })
    email?: string;

    @ApiProperty({
        description: '手機號碼',
        required: false,
        example: '0912123456',
    })
    phone?: string;

    @ApiProperty({
        description: '生日',
        required: false,
        example: '1934/01/01',
    })
    birthDate?: string;

    @ApiProperty({
        description: '地址',
        required: false,
        example: '新北市蘆洲區中山一路XX號',
    })
    address?: string;

    @ApiProperty({
        description: '差點',
        required: false,
        example: 56
    })
    handicap?: number;

    @ApiProperty({
        description: '圖片名稱',
        required: false,
        example: 'happy',
    })
    pic?: string;

    @ApiProperty({
        description: '加入日期',
    })
    joinDate?: string;

}