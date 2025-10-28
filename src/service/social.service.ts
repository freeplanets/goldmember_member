import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FriendOp } from '../classes/social/friend-op';
import { Friend, FriendDocument } from '../dto/schemas/friend.schema';
import { Member, MemberDocument } from '../dto/schemas/member.schema';
import { FuncWithTryCatchNew } from '../classes/common/func.def';
import { IMember } from '../dto/interface/member.if';
import { MessageToOp } from '../classes/social/message-to-op';

@Injectable()
export class SocialService {
    private friendOp:FriendOp;
    private messageOp:MessageToOp;
    constructor(
        @InjectModel(Member.name) private readonly modelMbr:Model<MemberDocument>,
        @InjectModel(Friend.name) private readonly modelFrd:Model<FriendDocument>,
    ){
        this.friendOp = new FriendOp(modelMbr, modelFrd);
        this.messageOp = new MessageToOp();
    }
    async makingFriend(inviteId:string, user:Partial<IMember>) {
        return FuncWithTryCatchNew(this.friendOp, 'making', inviteId, user.id);
    }
    async friendList(user:Partial<IMember>) {
        console.log(user);
        return FuncWithTryCatchNew(this.friendOp, 'get', user.id);
    }
    async undoFriend(undoId:string, user:Partial<IMember>) {
        return FuncWithTryCatchNew(this.friendOp, 'undo', undoId, user.id);
    }
    async messageTo(data:any, user:Partial<IMember>) {
        return FuncWithTryCatchNew(this.messageOp, 'send', data);
    }
}