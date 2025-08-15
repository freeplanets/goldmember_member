import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Team, TeamDocument, TeamSchema } from '../dto/schemas/team.schema';
import mongoose, { Connection, FilterQuery, Model, UpdateQuery } from 'mongoose';
import { TeamMemberDocument, TeamMember } from '../dto/schemas/team-member.schema';
import { v1 as uuidv1 } from 'uuid';
import { CommonResponseDto } from '../dto/common/common-response.dto';
import { ErrCode } from '../utils/enumError';
import { IActivityParticipants, IActMemberInfo, ICreditRecord, ITeam, ITeamActivity, ITeamMember, ITeamPositionInfo } from '../dto/interface/team-group.if';
import { GetTeamsResponse } from '../dto/teams/get-teams-response';
import { TeamDetailResponse } from '../dto/teams/team-detail-response';
import { Upload2S3 } from '../utils/upload-2-s3';
import { COLLECTION_REF, ORGANIZATION_TYPE, TeamMemberPosition, TeamMemberStatus } from '../utils/enum';
import { Member, MemberDcoument } from '../dto/schemas/member.schema';
import { TeamActivity, TeamActivityDocument } from '../dto/schemas/team-activity.schema';
import { ActivityParticipantsResponse } from '../dto/teams/activity-participants-response';
import { IMember } from '../dto/interface/member.if';
//import { KsMember, KsMemberDocument } from '../dto/schemas/ksmember.schema';
import { IbulkWriteItem, IHasId, IHasPhone, IOrganization } from '../dto/interface/common.if';
import TeamPositonInfo from '../dto/teams/team-position-info';
import { TeamUpdateRequestDto } from '../dto/teams/team-update-request.dto';
import { CreditRecordRes } from '../dto/teams/credit-record-response';
import { TeamActivitiesRes } from '../dto/teams/team-activities-response';
import { TEAM_DETAIL_FIELDS } from '../utils/base-fields-for-searh';
import { DateLocale } from '../classes/common/date-locale';
import { CreditRecord, CreditRecordDocument } from '../dto/schemas/credit-record.schema';
import { DateRangeQueryReqDto } from '../dto/common/date-range-query-request.dto';
import { CommonResponseData } from '../dto/common/common-response.data';
import { TeamMemberUpdateRequestDto } from '../dto/teams/team-member-update-request.dto';
import { KsMember, KsMemberDocument } from '../dto/schemas/ksmember.schema';
import { Announcement, AnnouncementDocument } from '../dto/schemas/announcement.schema';
import { AnnounceOp } from '../classes/announcements/announce-op';
import { FuncWithTryCatchNew } from '../classes/common/func.def';
import { IAnnouncement } from '../dto/interface/announcement.if';
import { MessageOp } from '../classes/announcements/message-op';

interface I_TMPositon {
    T: TeamPositonInfo;
    Pos: TeamMemberPosition;
}

@Injectable()
export class TeamsService {
    private myDate = new DateLocale();
    private annOp:AnnounceOp;
    constructor(
        @InjectModel(Team.name) private readonly modelTeam:Model<TeamDocument>,
        @InjectModel(TeamMember.name) private readonly modelTeamMember:Model<TeamMemberDocument>,
        @InjectModel(Member.name) private readonly modelMember:Model<MemberDcoument>,
        @InjectModel(KsMember.name) private readonly modelKs:Model<KsMemberDocument>,
        @InjectModel(CreditRecord.name) private readonly modelCreditRecord:Model<CreditRecordDocument>,
        @InjectModel(TeamActivity.name) private readonly modelTeamActivity:Model<TeamActivityDocument>,
        @InjectModel(Announcement.name) private readonly modelAnn:Model<AnnouncementDocument>,
        @InjectConnection() private readonly connection: Connection, // 
    ) {
        this.annOp = new AnnounceOp(modelMember, modelKs, modelAnn);
    }
    async getTeams(search:string=''){
        const teamRes = new GetTeamsResponse();
        const filter:FilterQuery<TeamDocument> = {};
        if (search !== '') {
            filter.name = { $regex: `${search}.*`}
        }
        try {
            teamRes.data = await this.modelTeam
                .find(filter, TEAM_DETAIL_FIELDS)
                .populate({
                    path: 'members',
                    select: 'role joinDate handicap status memberInfo memberFrom',
                    populate: {
                        path: 'memberInfo',
                        select: 'id no name pic handicap',
                    },
                })
                // .populate({
                //     path: 'creditHistory',
                //     select: 'date score reason recordedBy',
                // })
                // .populate({
                //     path: 'activities',
                //     // match: { date: { $gte: '2025/07/16'} },
                //     // select: 'id title date',
                // })
                .exec();
        } catch (error) {
            console.error('Error fetching teams:', error);
            teamRes.ErrorCode = ErrCode.UNEXPECTED_ERROR_ARISE;
            teamRes.error.extra = error.message;
        }
        return teamRes;
    }
    async getMyTeams(user:Partial<IMember>) {
        const teamRes = new GetTeamsResponse();
        try {
            const self = await this.modelMember.findOne({id:user.id}, 'id');
            const tmrs = await this.modelTeamMember.find({memberInfo: self._id}, 'teamId');
            if (tmrs.length > 0) {
                const teamIds = tmrs.map((tmr) => tmr.teamId);
                const teams = await this.modelTeam.find({id: {$in: teamIds }}, TEAM_DETAIL_FIELDS)
                .populate({
                    path: 'members',
                    select: 'role joinDate handicap status memberInfo memberFrom',
                    populate: {
                        path: 'memberInfo',
                        select: 'id no name pic handicap',
                    },
                })
                // .populate({
                //     path: 'creditHistory',
                //     select: 'date score reason recordedBy',
                // })
                // .populate({
                //     path: 'activities',
                //     // match: { date: { $gte: '2025/07/16'} },
                //     // select: 'id title date',
                // })
                .exec();
                teamRes.data = teams;
            }
        } catch (error) {
            console.log('getMyTeams error:', error);
            teamRes.ErrorCode = ErrCode.UNEXPECTED_ERROR_ARISE;
            teamRes.error.extra = error.message;
        }
        return teamRes;
    }   
    async getTeamDetail(teamId: string): Promise<TeamDetailResponse> {
        const teamDetailRes = new TeamDetailResponse();
        try {
            const team = await this.modelTeam
                .findOne({ id: teamId }, TEAM_DETAIL_FIELDS)
                .populate({
                    path:'members', 
                    select: 'role joinDate handicap status memberInfo memberFrom',
                    populate: {
                        path: 'memberInfo',
                        select: 'id no name pic handicap',
                        //localField: 'name',
                        //foreignField: 'member',
                    }
                })
                // .populate({
                //     path: 'creditHistory',
                //     select: 'date score reason recordedBy',
                // })
                // .populate({
                //     path: 'activities',
                //     // match: { date: { $gte: '2025/07/16'} },
                //     // select: 'id title date',
                // })
                .exec();
            if (!team) {
                teamDetailRes.ErrorCode = ErrCode.ITEM_NOT_FOUND;
            } else {
                teamDetailRes.data = team;
            }
        } catch (error) { 
            console.error('Error fetching team details:', error);
            teamDetailRes.ErrorCode = ErrCode.UNEXPECTED_ERROR_ARISE;
            teamDetailRes.error.extra = error.message;
        }
        return teamDetailRes;
    }

    async createTeam(
        teamInfo: Partial<ITeam>,   //TeamCreateRequestDto,
        file: Express.Multer.File | undefined = undefined,
        user:Partial<IMember>
    ): Promise<CommonResponseData> {
        const comRes= new CommonResponseData();
        try {
            const newTeam:Partial<ITeam> = {
                id: uuidv1(), // Generate a unique ID for the team
                name: teamInfo.name,
                description: teamInfo.description,
                contacter: {
                    id: user.id,
                    name: user.name,
                    phone: user.phone,
                }
            }
            //if (teamInfo.contacter) newTeam.contacter = teamInfo.contacter;

            if (file) {
                console.log("check1:", file);
                const rlt = await this.uploadLogo(file);
                if (rlt) {
                    console.log('filename:', rlt);
                    newTeam.logoUrl = rlt.fileUrl;
                    // newTeam.description = rlt.OriginalFilename;
                }
            }
            const myInfo = await this.modelMember.findOne({id: user.id}, 'id');
            const tmbrs:Partial<ITeamMember>[] = [];
            tmbrs.push({
                memberInfo: myInfo._id,
                memberFrom: COLLECTION_REF.Member,
                // id:	user.id,
                // name: user.name,
                // phone: user.phone,
                // membershipType: user.membershipType,
                // systemId: user.systemId,
                joinDate: this.myDate.toDateString(),
                handicap: user.handicap,
                teamId: newTeam.id,
                role: TeamMemberPosition.LEADER,
                status: TeamMemberStatus.CONFIRMED,
            })
            const session = await this.connection.startSession();
            session.startTransaction()
            //if (tmbrs.length > 0) {
                const ins = await this.modelTeamMember.insertMany(tmbrs, {session});
                console.log('insert teammembers:', ins);
                newTeam.members = ins.map((m) => m._id);
            //}
            const Team = new this.modelTeam(newTeam);
            const rlt = await Team.save({session});
            console.log('createTeam rlt:', rlt);
            if (rlt) {
                await session.commitTransaction();
                comRes.data = rlt;  // rlt.id;
            } else {
                await session.abortTransaction();
            }
            await session.endSession();
            //}
        } catch (error) {
            console.error('Error creating team:', error);
            comRes.ErrorCode = ErrCode.UNEXPECTED_ERROR_ARISE;
            comRes.error.extra = error.message;
        }
        return comRes;
    }
    async updateTeam(teamId: string, teamInfo: TeamUpdateRequestDto, file:Express.Multer.File): Promise<CommonResponseDto> {
        const comRes = new CommonResponseDto();
        try {
            const updTeam:UpdateQuery<TeamDocument> = {};
            const updTMData:IbulkWriteItem<TeamMemberDocument>[] = [];
            if (teamInfo.name) updTeam.name = teamInfo.name;
            if (teamInfo.description) updTeam.description = teamInfo.description;
            if (teamInfo.status) updTeam.status = teamInfo.status;
            //if (teamInfo.contacter) updTeam.contacter = teamInfo.contacter;
            const team = await this.modelTeam.findOne({id: teamId}).populate('members');
            if (team) {
                if (file) {
                    console.log("check1:", file);
                    const rlt = await this.uploadLogo(file);
                    if (rlt) {
                        console.log('filename:', rlt);
                        updTeam.logoUrl = rlt.fileUrl;
                        // newTeam.description = rlt.OriginalFilename;
                    }
                }
                console.log("updTeam:", updTeam);
                const updateResult = await this.modelTeam.updateOne({ id: teamId }, updTeam);
                if (updateResult.modifiedCount === 0) {
                    comRes.ErrorCode = ErrCode.ITEM_NOT_FOUND;
                }
            } else {
                comRes.ErrorCode = ErrCode.TEAM_NOT_FOUND;
            }
        } catch (error) {
            console.error('Error updating team:', error);
            comRes.ErrorCode = ErrCode.UNEXPECTED_ERROR_ARISE;
            comRes.error.extra = error.message;
        }
        return comRes;
    }
    async uploadLogo(logo: Express.Multer.File) {
        const upload2S3 = new Upload2S3();
        const ans = await upload2S3.uploadFile(logo);
        if (ans) {
            return upload2S3.Response;
        }
        return false;
    }
    async uploadTeamLogo(teamId: string, logo: Express.Multer.File): Promise<CommonResponseDto> {
        const comRes = new CommonResponseDto();
        try {
            if (logo) {
                // Assuming upload2S3 is a service that handles S3 uploads
                const upload2S3 = new Upload2S3();
                const ans = await upload2S3.uploadFile(logo);
                if (ans) {
                    const res = upload2S3.Response;
                    console.log('Logo uploaded successfully:', res);
                    const updateResult = await this.modelTeam.updateOne({ id:teamId }, { $set: { logoUrl: res.fileUrl } });
                    if (updateResult.modifiedCount === 0) {
                        comRes.ErrorCode = ErrCode.ITEM_NOT_FOUND;
                    }
                } 
            }
        } catch (error) {
            console.error('Error uploading team logo:', error);
            comRes.ErrorCode = ErrCode.UNEXPECTED_ERROR_ARISE;
            comRes.error.extra = error.message;
        }
        return comRes;
    }
    
    async joinTeamMember(teamId: string, user:Partial<IMember>): Promise<CommonResponseDto> {
        const comRes = new CommonResponseDto();
        try {
            const me = await this.modelMember.findOne({id: user.id});
            const teamMbr = await this.modelTeamMember.findOne({teamId, memberInfo: me._id});
            // console.log('teamMbr:', teamMbr)
            if (teamMbr) {
                comRes.ErrorCode = ErrCode.TEAM_MEMBER_ALREADY_EXISTS;
            } else {
                const newMember = await this.createNewMember(teamId, user);
                newMember.status = TeamMemberStatus.APPLYING;
                // console.log('newMember:', newMember);
                const session = await this.connection.startSession();
                session.startTransaction();
                const ins = await this.modelTeamMember.create([newMember], {session});
                // console.log('ins:', ins);
                if (ins) {
                    const upd = await this.modelTeam.updateOne({id: teamId}, {$push: { members: ins[0]._id }}, {session});
                    if (upd.acknowledged) {
                        await session.commitTransaction();
                        comRes.data = ins;                    
                    }
                } else {
                    comRes.ErrorCode = ErrCode.DATABASE_ACCESS_ERROR;
                }
                await session.endSession();
            }
        } catch (error) {
            console.error('Error adding team member:', error);
            comRes.ErrorCode = ErrCode.UNEXPECTED_ERROR_ARISE;
            comRes.error.extra = error.message;
        }
        return comRes;
    }

    async updateTeamMember(
        teamId: string,
        mbr: TeamMemberUpdateRequestDto
    ): Promise<CommonResponseDto> {
        const comRes = new CommonResponseDto();
        try {
            console.log('updateTeamMember:', teamId, mbr);
            const f = await this.modelMember.findOne({id: mbr.id}, 'id');
            const filter:FilterQuery<TeamMemberDocument> = {
                teamId,
                //id: mbr.id,
                memberInfo: f._id
            }
            const existingMember = await this.modelTeamMember.findOne(filter);
            console.log("existingMember:", filter, existingMember);
            if (!existingMember) {
                comRes.ErrorCode = ErrCode.MEMBER_NOT_FOUND;
                return comRes;
            }
            // Update the member information
            const session = await this.connection.startSession();
            session.startTransaction();
            let upd = await this.modelTeamMember.updateOne(
                { teamId, role: mbr.role },
                { role: TeamMemberPosition.MEMBER },
                { session }
            );
            console.log('upd1:', upd);
            upd = await this.modelTeamMember.updateOne(
                // {teamId, id: mbr},
                filter,
                {role: mbr.role},
                {session},
            )
            console.log('upd2:', upd, mbr)
            if (!upd.acknowledged) {
                await session.abortTransaction();
            } else {
                await session.commitTransaction();
            }
            await session.endSession();
        } catch (error) {
            console.error('Error updating team member:', error);
            comRes.ErrorCode = ErrCode.UNEXPECTED_ERROR_ARISE;
            comRes.error.extra = error.message;
        }
        return comRes;
    }

    async leaveTeam(
        teamId: string,
        user: Partial<IMember>
    ): Promise<CommonResponseDto> {
        const comRes = new CommonResponseDto();
        try {
            const me = await this.modelMember.findOne({id: user.id}, 'id');
            if (me) {
                const existingMember = await this.modelTeamMember.findOne({ teamId, memberInfo: me._id });
                if (!existingMember) {
                    comRes.ErrorCode = ErrCode.MEMBER_NOT_FOUND;
                    return comRes;
                }
                // Delete the member from the team
                const session = await this.connection.startSession();
                session.startTransaction();
                //const upd = await this.modelTeamMember.updateOne({ teamId, id: user.id }, {status: TeamMemberStatus.CANCELLED}, { session });
                const del = await this.modelTeamMember.deleteOne({ teamId, memberInfo: me._id }, { session });
                console.log('del:', del);
                if (del.acknowledged) {
                    // Remove the member's ID from the team's members array
                    await this.modelTeam.updateOne({ id: teamId }, { $pull: { members: existingMember._id } }, { session });
                    await session.commitTransaction();
                    console.log('Team member leave successfully:', existingMember);
                }
                await session.endSession();
            } else {
                comRes.ErrorCode = ErrCode.MEMBER_NOT_FOUND;
            }
        } catch (error) {
            console.error('Error deleting team member:', error);
            comRes.ErrorCode = ErrCode.UNEXPECTED_ERROR_ARISE;
            comRes.error.extra = error.message;
        }
        return comRes;
    }
    async acceptMember(teamId:string, memberId:string, user:Partial<IMember>) {
        const comRes = new CommonResponseDto();
        // const session = await this.connection.startSession();
        // session.startTransaction();
        try {
            //console.log('memberId:', memberId);
            const isNotMgr = await this.isNotTeamManageLevel(teamId, user._id);
            if (isNotMgr) {
                comRes.ErrorCode = isNotMgr;
                return comRes;
            }            
            const mbr = await this.modelMember.findOne({id: memberId}, 'id');
            console.log('mbr:', mbr, memberId);
            if (mbr) {
                const upd = await this.modelTeamMember.findOneAndUpdate(
                    {teamId, memberInfo: mbr._id},
                    {status: TeamMemberStatus.CONFIRMED}, 
                    // {session}
                );
                console.log('acceptMember upd:', upd);
                if (upd) {
                    comRes.data = upd;
                    // const ins = await this.modelTeam.updateOne({id: teamId}, {$push: {members: upd._id}}, {session});
                    // console.log('acceptMember ins:', ins);
                    // if (ins) {
                    //     await session.commitTransaction();
                    // }
                }
            } else {
                comRes.ErrorCode = ErrCode.MEMBER_NOT_FOUND;
            }
        } catch (error) {
            console.log('acceptMember', error);
            // session.abortTransaction();
            comRes.ErrorCode = ErrCode.UNEXPECTED_ERROR_ARISE;
            comRes.error.extra = error.message;
        }
        //session.endSession();
        return comRes;        
    }
    async denyMember(teamId:string, memberId:string, user:Partial<IMember>, notes:string) {
        const msgOp = new MessageOp(this.modelAnn);
        const comRes = new CommonResponseDto();
        try {
            const isNotMgr = await this.isNotTeamManageLevel(teamId, user._id);
            if (isNotMgr) {
                comRes.ErrorCode = isNotMgr;
                return comRes;
            }
            const member = await this.modelMember.findOne({id: memberId}, 'id');
            if (member) {
                const existingMember = await this.modelTeamMember.findOne({ teamId, memberInfo: member._id });
                if (!existingMember) {
                    comRes.ErrorCode = ErrCode.MEMBER_NOT_FOUND;
                    return comRes;
                }
                // Delete the member from the team
                const session = await this.connection.startSession();
                session.startTransaction();
                //const upd = await this.modelTeamMember.updateOne({ teamId, id: user.id }, {status: TeamMemberStatus.CANCELLED}, { session });
                const del = await this.modelTeamMember.deleteOne({ teamId, memberInfo: member._id }, { session });
                console.log('del:', del);
                if (del.acknowledged) {
                    // Remove the member's ID from the team's members array
                    const team = await this.modelTeam.findOneAndUpdate({ id: teamId }, { $pull: { members: existingMember._id } }, { session });
                    await session.commitTransaction();
                    console.log('Team member leave successfully:', existingMember);
                    const memo = notes ? ' memo:' + notes : '';
                    const title = `${team.name}通知`;
                    const msg = `${team.name}通知，您的入隊申請己取消，特此告之。${memo}`;
                    msgOp.createPersonalMsg(memberId, title ,msg);
                    const ans = await msgOp.send();
                    console.log('send message:', ans);
                }
                await session.endSession();
            } else {
                comRes.ErrorCode = ErrCode.MEMBER_NOT_FOUND;
            }
        } catch (error) {
            console.error('Error deleting team member:', error);
            comRes.ErrorCode = ErrCode.UNEXPECTED_ERROR_ARISE;
            comRes.error.extra = error.message;
        }
        return comRes;        
    }
    async createTeamActivity(teamId:string, taCreate:Partial<ITeamActivity>, user:Partial<IMember>):Promise<CommonResponseDto> {
        const comRes = new CommonResponseDto();
        const session = await this.connection.startSession();
        session.startTransaction();
        try {
            const team = await this.modelTeam.findOne({id: teamId});
            if (team) {
                taCreate.teamId = teamId;
                taCreate.id = uuidv1();
                taCreate.creator = {
                    modifiedByWho: user.name,
                    modifiedBy: user.id,
                    modifiedAt: Date.now(),
                }
                const act = new this.modelTeamActivity(taCreate);
                const ans = await act.save({session});
                if (ans) {
                    const t = await this.modelTeam.updateOne(
                        {id: teamId}, 
                        {$push: { activities: ans._id }},
                        { session}
                    )
                    if (t) {
                        await session.commitTransaction();
                    } else {
                        await session.abortTransaction();
                        comRes.ErrorCode = ErrCode.DATABASE_ACCESS_ERROR;
                    }
                } else {
                    comRes.ErrorCode = ErrCode.DATABASE_ACCESS_ERROR;
                }
                
            }  else {
                comRes.ErrorCode = ErrCode.TEAM_NOT_FOUND;
            }
        } catch(error) {
            console.log('create TeamActivity error:', error);
            comRes.ErrorCode = ErrCode.UNEXPECTED_ERROR_ARISE;
            comRes.error.extra = error.message;
        }
        await session.endSession();
        return comRes;
    }

    async modifyTeamActivity(teamId:string, actId:string, modifyAct:Partial<ITeamActivity>, user:Partial<IMember>){
        const comRes = new CommonResponseDto();
        try {
            if (Object.keys(modifyAct).length > 0) {
                const act = await this.modelTeamActivity.findOne({teamId, id: actId});
                if (act) {
                    modifyAct.updater = {
                        modifiedBy: user.id,
                        modifiedByWho: user.name,
                        modifiedAt: Date.now(),
                    }
                    const t = await this.modelTeamActivity.updateOne(
                        { teamId, id: actId}, 
                        { $set: modifyAct}
                    )
                    console.log('modifyTeamActivity:', t);
                    if (!t) { 
                        comRes.ErrorCode = ErrCode.DATABASE_ACCESS_ERROR;
                    }                
                }  else {
                    comRes.ErrorCode = ErrCode.TEAM_NOT_FOUND;
                }
            } else {
                comRes.ErrorCode = ErrCode.MISS_PARAMETER;
            }
        } catch(error) {
            console.log('modify TeamActivity error:', error);
            comRes.ErrorCode = ErrCode.UNEXPECTED_ERROR_ARISE;
            comRes.error.extra = error.message;
        }
        return comRes;        
    }
    async getActivityParticipants(activityId:string):Promise<ActivityParticipantsResponse> {
        const comRes = new ActivityParticipantsResponse();
        try {
            const act = await this.modelTeamActivity
                .findOne({id: activityId}, 'participants')
                .populate({ 
                    path:'participants',
                    select: 'role handicap memberInfo memberFrom',
                    populate: {
                        path: 'memberInfo',
                        select: 'id no name pic handicap',
                    }
                }).exec();
            if (act) {
                const mbrs = act.participants.map((p:IActivityParticipants) => {
                    // console.log('getAct:', p);
                    // const nMbr:Partial<IActMemberInfo> = {
                    //     ...(p.member as Partial<IMember>),
                    //     registrationDate: p.registrationDate,
                    //     status: p.status,
                    //     // id: p.member.id,
                    //     // name: p.name,
                    //     // phone: p.phone,
                    //     // membershipType: p.membershipType,
                    //     // registrationDate: f.registrationDate,
                    //     // status: f.status,
                    // };
                    return p; //nMbr;
                });
                comRes.data = mbrs;
            } else {
                comRes.ErrorCode = ErrCode.TEAM_ACTIVITY_NOT_FOUND;
            }
        } catch(error) {
            console.log('getActivityParticipants error:', error);
            comRes.ErrorCode = ErrCode.UNEXPECTED_ERROR_ARISE;
            comRes.error.extra = error.message;
        }
        return comRes;
    }
    async getMember<T extends IHasId>(obj:T){
        let tmbr:Partial<ITeamMember>={};
        // if (KS_MEMBER_STYLE_FOR_SEARCH.test(obj.id)) {
        //     tmbr = await this.getKsMember(obj.id);
        // } else {
             tmbr = await this.getAppMember(obj);
        // }
        tmbr.joinDate = this.myDate.toDateString();
        tmbr.isActive = true;
        // if (obj.phone) {
        //     tmbr.phone = obj.phone;
        // }
        if (obj.role) {
            tmbr.role = obj.role;
        }
        if (!tmbr.handicap) tmbr.handicap = 0;
        return tmbr;        
    }
    // async getKsMember(no:string) {
    //     let tmbr:ITeamMember={};
    //     try {
    //         const obj = await this.modelKs.findOne({no});
    //         tmbr.id = obj.no;
    //         tmbr.name = obj.name;
    //         // tmbr.phone = obj.phone;
    //         tmbr.handicap = 0;
            
    //     } catch (error) {
    //         console.log('getKsMember error:', error);
    //     }
    //     return tmbr;
    // }
    async getAppMember<T extends IHasId>(obj:T){
        let tmbr:Partial<ITeamMember>={};
        try {
            const mbr = await this.modelMember.findOne(
                {id: obj.id}, 
                'id'
            );
            console.log('getAppMember:', obj, mbr);
            if (mbr) {
                 tmbr = {
                    //id:	mbr.id,
                    memberInfo: mbr._id,
                    memberFrom: COLLECTION_REF.Member,
                    // name: mbr.name,
                    // phone: mbr.phone,
                    // membershipType: mbr.membershipType,
                    // systemId: mbr.systemId,
                    handicap: mbr.handicap,
                }
            } else {
                tmbr = {
                    //name: obj.name,
                    //phone: obj.phone,
                }
            }
            return tmbr;
        } catch (err) {
            console.log('getMember error:', err);
        }
        return tmbr;
    }

    async getCreditRecords(teamId:string, dates:DateRangeQueryReqDto) {
        const comRes = new CreditRecordRes();
        try {
            const filter:FilterQuery<CreditRecordDocument> = {
                refId: teamId,
            }
            if (dates.endDate && dates.startDate ) {
                filter.$and =  [
                    { date: { $gte: dates.startDate }},
                    { date: { $lte: dates.endDate}},
                ];
            } else if ( dates.startDate) {
                filter.date = { $gte: dates.startDate };
            } else if (dates.endDate) {
                filter.date = { $lte: dates.endDate };
            }
            console.log('filter:', filter, filter.$and);
            comRes.data = await this.modelCreditRecord.find(filter);
        } catch(error) {
            console.log('getCreditRecords error:', error);
            comRes.ErrorCode = ErrCode.UNEXPECTED_ERROR_ARISE;
            comRes.error.extra = error.message;
        }
        return comRes;
    }
    async getActivitiesLastThreeMonths(teamId:string) {
        const dates=new DateRangeQueryReqDto();
        dates.startDate = this.myDate.toDateString();
        dates.endDate = this.myDate.AddMonth(3);
        return this.getActivities(teamId, dates);
    }
    async getActivities(teamId:string, dates:DateRangeQueryReqDto){
        const comRes = new TeamActivitiesRes();
        try {
            const filter:FilterQuery<CreditRecordDocument> = {
                teamId,
            }
            if (dates.endDate && dates.startDate ) {
                filter.$and =  [
                    { date: { $gte: dates.startDate }},
                    { date: { $lte: dates.endDate}},
                ];
            } else if ( dates.startDate) {
                filter.date = { $gte: dates.startDate };
            } else if (dates.endDate) {
                filter.date = { $lte: dates.endDate };
            }
            console.log('filter:', filter, filter.$and);
            comRes.data = await this.modelTeamActivity.find(filter);
        } catch(error) {
            console.log('getCreditRecords error:', error);
            comRes.ErrorCode = ErrCode.UNEXPECTED_ERROR_ARISE;
            comRes.error.extra = error.message;
        }
        return comRes;        
    }
    async joinActivity(teamId:string, activityId:string, user:Partial<IMember>) {
        const comRes = new CommonResponseDto();
        try {
            const tmr = await this.modelTeamMember.findOne({teamId, memberInfo: user._id, status: TeamMemberStatus.CONFIRMED});
            console.log('joinActivity:', tmr, user._id, user.id);
            if (tmr) {
                const jAct = await this.modelTeamActivity.findOne({id: activityId});
                if (jAct.participants.length < jAct.maxParticipants) {
                    const actUpd = await this.modelTeamActivity.updateOne({id: activityId}, {$push: { participants: tmr._id}});
                    console.log(actUpd)
                } else {
                    comRes.ErrorCode = ErrCode.TEAM_ACTIVITY_MAX_PARTICIPANTS;
                }
            } else {
                comRes.ErrorCode = ErrCode.NOT_A_TEAM_MEMBER;
            }
        } catch (error) {
            console.log('joinActivity error:', error);
            comRes.ErrorCode = ErrCode.UNEXPECTED_ERROR_ARISE;
            comRes.error.extra = error.message;
        }
        return comRes;
    }
    async leaveActivity(teamId:string, activityId:string, user:Partial<IMember>) {
        const comRes = new CommonResponseDto();
        try {
            const tmr = await this.modelTeamMember.findOne({teamId, memberInfo: user._id, status: TeamMemberStatus.CONFIRMED});
            console.log('leaveAct:', tmr, )
            if (tmr) {
                const actUpd = await this.modelTeamActivity.updateOne({id: activityId}, {$pull: { participants: tmr._id}});
                console.log(actUpd)
            } else {
                comRes.ErrorCode = ErrCode.NOT_A_TEAM_MEMBER;
            }
        } catch (error) {
            console.log('joinActivity error:', error);
            comRes.ErrorCode = ErrCode.UNEXPECTED_ERROR_ARISE;
            comRes.error.extra = error.message;
        }
        return comRes;        
    }
    async createNewMember(teamId:string,user:Partial<IMember>):Promise<Partial<ITeamMember>> {
        const f = await this.modelMember.findOne({id: user.id});
        return {
            teamId,
            // id: user.id,
            memberInfo: f._id,
            memberFrom: COLLECTION_REF.Member,
            // name: user.name,
            // phone: user.phone,
            // membershipType: user.membershipType,
            // systemId: user.systemId,
            handicap: user.handicap,
            role: TeamMemberPosition.MEMBER,
        }        
    }
    async announcementsGet(teamId:string) {
        const filter:FilterQuery<AnnouncementDocument> = {};
        filter['organization.id'] = teamId,
        filter.$and = [
            {publishDate: {$gte: this.myDate.toDateString() }},
            {publishDate: {$lte: this.myDate.AddMonth(3)}},
        ];
        console.log(filter, filter.$and);
        return FuncWithTryCatchNew(this.annOp, 'list', filter);
    }
    async announcementsPost(teamId:string, user:Partial<IMember>, tAnnCreateDto:Partial<IAnnouncement>, files: Array<Express.Multer.File> ) {
        //announcementsPost(user,announcementCreateDto,files,org = ORGANIZATION)
        const org:IOrganization = {
            id: teamId,
            type: ORGANIZATION_TYPE.TEAM,
        };
        tAnnCreateDto.isPublished = true;
        tAnnCreateDto.publishedTs = Date.now();
        return FuncWithTryCatchNew(this.annOp, 'announcementsPost', user, tAnnCreateDto, files, org);
    }
    async announcementsIdPut(teamId:string, user:Partial<IMember>, annId:string,tAnnUpdateDto:Partial<IAnnouncement>, files:Array<Express.Multer.File>) {
        //announcementsIdPut(user,id,announceUpdateDto,files)
        const org:IOrganization = {
            id: teamId,
            type: ORGANIZATION_TYPE.TEAM,
        };
        return FuncWithTryCatchNew(this.annOp, 'announcementsIdPut', user, annId, tAnnUpdateDto, files, org);
    }
    async announcementsDel(teamId:string, annId:string) {
        const org:IOrganization = {
            id: teamId,
            type: ORGANIZATION_TYPE.TEAM,
        };
        return FuncWithTryCatchNew(this.annOp, 'delete', annId, org);        
    }
    async reformTeamMemberData() {
        let bulks:IbulkWriteItem<TeamDocument>[] = [];
        let bulkT:IbulkWriteItem<TeamMemberDocument>[] = [];
        const oldTmrs = await this.modelTeamMember.find({memberInfo: {$exists: false}});
        bulks = oldTmrs.map((itm) => {
            bulkT.push({
                deleteOne: {
                    filter: { _id: itm._id },
                }
            });
            return {
                updateOne: {
                    filter: { id: itm.teamId },
                    update: {
                        $pull: { members: itm._id }
                    }
                }
            }
        });
        console.log(bulkT)
        const upds = await this.modelTeam.bulkWrite(bulks as any);
        const dels = await this.modelTeamMember.bulkWrite(bulkT as any);
        return { upds, dels};
    }
    async isNotTeamManageLevel(teamId:string, _id:string) {
        const tmr = await this.modelTeamMember.findOne({teamId, memberInfo: _id});
        if (tmr) {
            if (tmr.role !== TeamMemberPosition.LEADER && tmr.role !== TeamMemberPosition.MANAGER) {
                return ErrCode.TEAM_LEVEL_ERROR;
            }
        } else {
            return ErrCode.NOT_A_TEAM_MEMBER;
        }
        return false;
    }
}