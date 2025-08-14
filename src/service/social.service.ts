import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FriendOp } from '../classes/social/friend-op';
import { Friend, FriendDocument } from '../dto/schemas/friend.schema';
import { Member, MemberDcoument } from '../dto/schemas/member.schema';
import { FuncWithTryCatchNew } from '../classes/common/func.def';
import { IMember } from '../dto/interface/member.if';


@Injectable()
export class SocialService {
    private friendOp:FriendOp;
    constructor(
        @InjectModel(Member.name) private readonly modelMbr:Model<MemberDcoument>,
        @InjectModel(Friend.name) private readonly modelFrd:Model<FriendDocument>,
    ){
        this.friendOp = new FriendOp(modelMbr, modelFrd);
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
}