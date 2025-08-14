import { ApiProperty } from '@nestjs/swagger';
import { IMember } from '../interface/member.if';

export class FriendMemberInfo implements Partial<IMember> {
    @ApiProperty ({
        description: '會員ID',
    })
    id: string;

    @ApiProperty({
        description: '會員名稱',
    })
    name?: string;

    @ApiProperty({
        description: '圖片名稱或連結',
    })
    pic?: string;
}