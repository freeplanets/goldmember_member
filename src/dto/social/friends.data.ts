import { ApiProperty } from '@nestjs/swagger';
import { IFriend } from '../interface/social.if';
import { FriendMemberInfo } from './friend-memberInfo.data';

export class FriendData implements Partial<IFriend> {
    @ApiProperty({
        description: '會員名稱',
    })
    nickname?: string;

    @ApiProperty({
        description: '會員資料',
        type: FriendMemberInfo,
    })
    memberInfo?: any;
    @ApiProperty({
        description: '交友時間戳',
        type: Number,
    })
    occurTS?: number;
}