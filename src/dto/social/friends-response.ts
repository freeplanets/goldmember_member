import { ApiProperty } from "@nestjs/swagger";
import { CommonResponseDto } from "../common/common-response.dto";
import { ICommonResponse } from "../interface/common.if";
import { FriendData } from "./friends.data";

export class FriendsRes extends CommonResponseDto implements ICommonResponse<FriendData[]> {
    @ApiProperty({
        description: '朋友列表',
        type: FriendData,
        isArray: true,
    })
    data?: any;
}