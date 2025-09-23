import { Model } from 'mongoose';
import { IbulkWriteItem, IReturnObj } from '../../dto/interface/common.if';
import { FriendDocument } from '../../dto/schemas/friend.schema';
import { MemberDocument } from '../../dto/schemas/member.schema';
import { ErrCode } from '../../utils/enumError';
import {v1 as uuidv1} from 'uuid';
import { IFriend } from '../../dto/interface/social.if';

export class FriendOp {
    constructor(
        private readonly modelMbr:Model<MemberDocument>,
        private readonly modelFrd:Model<FriendDocument>,
    ) {}
    async making(inviteId:string, acceptId:string) {
        const rtn:IReturnObj = {};
        const exists = await this.checkFriendExists(inviteId, acceptId);
        if (!exists) {
            const self = await this.getMemberInfo(inviteId);
            const friend = await this.getMemberInfo(acceptId);
            const bulks:IbulkWriteItem<FriendDocument>[]=[];
            const data1:Partial<IFriend> = {
                id: uuidv1(),
                memberInfo: self._id,
                memberId: acceptId,
                nickname: self.name,
                occurTS: Date.now(),
            };
            const data2:Partial<IFriend> = {
                id: uuidv1(),
                memberInfo: friend._id,
                memberId: inviteId,
                nickname: friend.name,
                occurTS: Date.now(),                
            };
            bulks.push({
                insertOne: {
                    document: data1 as any
                }
            });
            bulks.push({
                insertOne: {
                    document: data2 as any
                }
            });
            const ins = await this.modelFrd.bulkWrite(bulks as any);
            if (ins.insertedCount > 0) {
                rtn.data = ins;
            } else {
                rtn.error = ErrCode.DATABASE_ACCESS_ERROR;
            }
        } else {
            rtn.error = ErrCode.FRIEND_EXISTS_ERROR;
        }
        return rtn;
    }
    private async checkFriendExists(selfId:string, frieldId:string) {
        const friend = await this.modelMbr.findOne({id: frieldId}, 'name');
        if (friend) {
            const inFList = await this.modelFrd.findOne({memberId: selfId, memberInfo: friend._id}, 'id');
            if (inFList) return true;
        }
        return false;
    }
    private async getMemberInfo(id:string) {
        return await this.modelMbr.findOne({id}, 'name');
    }
    async get(selfId:string) {
        const rtn:IReturnObj = {};
        const ans = await this.modelFrd.find({memberId: selfId}, 'id memerInfo nickname occurTS').populate({
            path:'memberInfo',
            select: 'id name pic handicap displayName',
        });
        if (ans) {
            rtn.data = ans;
        } else {
            rtn.error = ErrCode.DATABASE_ACCESS_ERROR;
        }
        return rtn;
    }
    async undo(inviteId:string, acceptId:string) {
        const rtn:IReturnObj = {};
        const exists = await this.checkFriendExists(inviteId, acceptId);
        if (exists) {
            const self = await this.getMemberInfo(inviteId);
            const friend = await this.getMemberInfo(acceptId);
            const bulks:IbulkWriteItem<FriendDocument>[]=[];
            bulks.push({
                deleteOne: {
                    filter: {
                        memberId: inviteId,
                        memberInfo: friend._id,
                    }
                }
            });
            bulks.push({
                deleteOne: {
                    filter: {
                        memberId: acceptId,
                        memberInfo: self._id,
                    }
                }
            });
            const dels = await this.modelFrd.bulkWrite(bulks as any);
            if (dels.deletedCount > 0) {
                rtn.data = dels;
            } else {
                rtn.error = ErrCode.DATABASE_ACCESS_ERROR;
            }
        } else {
            rtn.error = ErrCode.FRIEND_NOT_EXISTS_ERROR;
        }
        return rtn;        
    }
}