import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, Query, Req, Res, UploadedFile, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CommonResponseDto } from '../dto/common/common-response.dto';
import TeamCreateRequestDto from '../dto/teams/team-create-request.dto';
import { Request, Response } from 'express';
import { TeamDetailResponse } from '../dto/teams/team-detail-response';
import { TeamUpdateRequestDto } from '../dto/teams/team-update-request.dto';
import { AnyFilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { FileUploadDto } from '../dto/common/file-upload.dto';
import { TeamMemberUpdateRequestDto } from '../dto/teams/team-member-update-request.dto';
import { TokenGuard } from '../utils/tokens/token-guard';
import { TeamActivitiesCreateRequestDto } from '../dto/teams/team-activities-create-request.dto';
import { TeamActivitiesModifyRequestDto } from '../dto/teams/team-activities-modify-request.dto';
import { ActivityParticipantsResponse } from '../dto/teams/activity-participants-response';
import { TeamActivitiesRes } from '../dto/teams/team-activities-response';
import { TeamsService } from '../service/teams.service';
import { FormDataPipe } from '../utils/pipes/form-data';
import { FileNamePipe } from '../utils/pipes/file-name';
import { DateRangeQueryReqDto } from '../dto/common/date-range-query-request.dto';
import { AnnouncementsResponseDto } from '../dto/announcements/announcements-response.dto';
import { TeamAnnouncementCreateDto } from '../dto/announcements/team-announcement-create.dto';
import { TeamAnnouncementModifyDto } from '../dto/announcements/team-announcement-modify.dto';
import { TeamAcceptReqDto } from '../dto/teams/accept-request.dto';
import { TeamDenyReqDto } from '../dto/teams/deny-request.dto';
import { AddTraceIdToResponse } from '../utils/constant';
import { BadWordsPipe } from '../utils/pipes/bad-words';

@Controller('teams')
@ApiTags('teams')
@UseGuards(TokenGuard)
@ApiBearerAuth()
export class TeamsController {
    constructor(private readonly teamsService:TeamsService) {}

    @ApiOperation({
        summary: "取得球隊列表",
        description: "取得球隊列表.",
    })
    @ApiResponse({
        description: '成功或失敗',
        type: CommonResponseDto,
    })
    @ApiQuery({name: 'search', description: '球隊名稱關鍵字查詢', required:false})
    @Get()
    async getTeams(
        @Query('search') search: string,
        @Req() req: Request,
        @Res() res: Response
    ) {
        const result = await this.teamsService.getTeams(search);
        AddTraceIdToResponse(result, req);
        return res.status(HttpStatus.OK).json(result);
    }

    @ApiOperation({
        summary: "查詢參與的球隊",
        description: "查詢參與的球隊.",
    })
    @ApiResponse({
        description: '成功或失敗',
        type: CommonResponseDto,
    })
    @Get('myteam')
    async getMyTeams(
        @Req() req: any,
        @Res() res: Response
    ) {
        const result = await this.teamsService.getMyTeams(req.user);
        AddTraceIdToResponse(result, req);
        return res.status(HttpStatus.OK).json(result);
    }

    @ApiOperation({
        summary: "新增球隊",
        description: "新增球隊.",
    })
    @ApiResponse({
        description: '成功或失敗',
        type: CommonResponseDto,
    })
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('file'))
    @Post()
    async createTeam(
        @Body(FormDataPipe) teamInfo: TeamCreateRequestDto,
        @UploadedFile() file: Express.Multer.File,
        @Req() req:any,
        @Res() res:Response
    ) {
        // Logic to create a team will go here
        const result = await this.teamsService.createTeam(teamInfo, file, req.user);
        AddTraceIdToResponse(result, req);
        return res.status(HttpStatus.OK).json(result);
    }

    @ApiOperation({
        summary: "取得球隊資訊",
        description: "取得球隊資訊.",
    })
    @ApiResponse({
        description: '成功或失敗',
        type: TeamDetailResponse,
    })
    @Get(':id')
    async getTeamDetail(
        @Param('id') teamId: string,
        @Req() req: Request,
        @Res() res: Response
    ) {
        // Logic to get team details will go here
        const result = await this.teamsService.getTeamDetail(teamId);
        AddTraceIdToResponse(result, req);
        return res.status(HttpStatus.OK).json(result);
    }

    @ApiOperation({
        summary: "更新球隊資訊",
        description: "更新球隊資訊.",
    })
    @ApiResponse({
        description: '成功或失敗',
        type: CommonResponseDto,
    })
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('file'))    
    @Put(':id')
    async updateTeam(
        @Param('id') teamId: string, 
        @Body(FormDataPipe) teamInfo: TeamUpdateRequestDto,
        @UploadedFile() file:Express.Multer.File,
        @Req() req: Request,
        @Res() res: Response
    ) {
        // Logic to update a team will go here
        const result = await this.teamsService.updateTeam(teamId, teamInfo, file);
        AddTraceIdToResponse(result, req);
        return res.status(HttpStatus.OK).json(result);
    }

    @ApiOperation({
        summary: "上傳球隊Logo",
        description: "上傳球隊Logo.",
    })
    @ApiResponse({
        description: '成功或失敗',
        type: CommonResponseDto,
    })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        description: '公告內容及上傳檔案',
        type: FileUploadDto,
    })    
    @UseInterceptors(FileInterceptor('file')) 
    @Post('logo/:id')
    async uploadTeamLogo(
        @Param('id') teamId: string,
        @Body(FileNamePipe) fileUploadDto: FileUploadDto,
        @UploadedFile() file: Express.Multer.File,
        @Req() req: Request,
        @Res() res: Response
    ) {
        const result = await this.teamsService.uploadTeamLogo(teamId, file);
        AddTraceIdToResponse(result, req);
        return res.status(HttpStatus.OK).json(result);
    }

    @ApiOperation({
        summary: "申請加入球隊",
        description: "申請加入球隊",
    })
    @ApiResponse({
        description: '成功或失敗',
        type: CommonResponseDto,
    })
    @ApiParam({name: 'id', description: '球隊代號'})
    @Post('join/:id')
    async addTeamMember(
        //@Body() memberInfo: TeamMemberAddRequestDto,
        @Param('id') teamId: string,
        @Req() req:any,
        @Res() res: Response) {
        // Logic to add a team member will go here
        const result = await this.teamsService.joinTeamMember(teamId, req.user);
        AddTraceIdToResponse(result, req);
        return res.status(HttpStatus.OK).json(result);
    }

    @ApiOperation({
        summary: "設定隊員角色",
        description: "設定隊員角色.",
    })
    @ApiResponse({
        description: '成功或失敗',
        type: CommonResponseDto,
    })
    @ApiParam({ name: 'id', description: '球隊 ID' })
    @Put('position/:id')
    async updateTeamMember(
        @Body() memberInfo: TeamMemberUpdateRequestDto,
        @Param('id') teamId: string,
        @Req() req: Request,
        @Res() res: Response
    ) {
        const result = await this.teamsService.updateTeamMember(teamId, memberInfo);
        AddTraceIdToResponse(result, req);
        return res.status(HttpStatus.OK).json(result);
    }

    @ApiOperation({
        summary: "隊員退出球隊",
        description: "隊員退出球隊",
    })
    @ApiResponse({
        description: '成功或失敗',
        type: CommonResponseDto,
    })
    @ApiParam({ name: 'id', description: '球隊 ID' })
    @Delete('leave/:id')
    async leaveTeam(
        @Param('id') teamId: string,
        @Req() req:any,
        @Res() res: Response
    ){
        const result = await this.teamsService.leaveTeam(teamId, req.user);
        AddTraceIdToResponse(result, req);
        return res.status(HttpStatus.OK).json(result);
    }

    @ApiOperation({
        summary: "接受加入球隊",
        description: "接受加入球隊.",
    })
    @ApiResponse({
        description: '成功或失敗',
        type: CommonResponseDto,
    })
    @ApiParam({name: 'id', description: '球隊 ID', required: true})
    //@ApiParam({name: 'memberId', description: '會員 ID', required: true})
    @Post('accept/:id')
    async acceptMember(
        @Param('id') teamId: string,
        //@Param('memberId') memberId: string,
        @Body() { memberId }:TeamAcceptReqDto,
        @Req() req: any,
        @Res() res: Response,
    ){
        const result = await this.teamsService.acceptMember(teamId, memberId, req.user);
        AddTraceIdToResponse(result, req);
        return res.status(HttpStatus.OK).json(result);
    }

    @ApiOperation({
        summary: "拒絕加入球隊",
        description: "拒絕加入球隊.",
    })
    @ApiResponse({
        description: '成功或失敗',
        type: CommonResponseDto,
    })
    @ApiParam({name: 'id', description: '球隊 ID', required: true})
    // @ApiParam({name: 'memberId', description: '會員 ID', required: true})
    @Post('deny/:id')
    async denyMember(
        @Param('id') teamId: string,
        // @Param('memberId') memberId: string,
        @Body() {memberId, notes}:TeamDenyReqDto,
        @Req() req: any,
        @Res() res: Response,
    ){
        const result = await this.teamsService.denyMember(teamId, memberId, req.user, notes);
        AddTraceIdToResponse(result, req);
        return res.status(HttpStatus.OK).json(result);
    }    
    // @ApiOperation({
    //     summary: "查詢球隊信用評分",
    //     description: "查詢球隊信用評分.",
    // })
    // @ApiResponse({
    //     description: '成功或失敗',
    //     type: CreditRecordRes,
    // })
    // @ApiParam({name: 'id', description: '球隊代號'})
    // @Get('creditrecords/:id')
    // async getCreditRecords(
    //     @Param('id') teamId: string,
    //     @Query() dates:DateRangeQueryReqDto,
    //     @Res() res:Response,
    // ){
    //     const rlt = await this.teamsService.getCreditRecords(teamId, dates);
    //     return res.status(HttpStatus.OK).json(rlt);
    // }

    @ApiOperation({
        summary: "新增球隊活動",
        description: "新增球隊活動.",
    })
    @ApiResponse({
        description: '成功或失敗',
        type: CommonResponseDto,
    })
    @ApiParam({ name: 'id', description: '球隊 ID' })
    @Post('activities/:id')
    async createTeamActivity(
        @Param('id') teamId:string,
        @Body() taCreate:TeamActivitiesCreateRequestDto,
        @Req() req:any,
        @Res() res:Response,
    ){
        const result = await this.teamsService.createTeamActivity(teamId, taCreate, req.user);
        AddTraceIdToResponse(result, req);
        return res.status(HttpStatus.OK).json(result);
    }

    @ApiOperation({
        summary: '更新球隊活動',
        description: '更新球隊活動',
    })
    @ApiResponse({
        description: '成功或失敗',
        type: CommonResponseDto,
    })
    @ApiParam({name: 'id', description: '球隊ID', required: true})
    @ApiParam({name: 'activityId', description: '活動ID', required: true})
    @Put('activities/:id/:activityId')
    async modifyTeamActivity(
        @Param('id') teamId:string,
        @Param('activityId') actId:string,
        @Body() modifyAct: TeamActivitiesModifyRequestDto,
        @Req() req:any,
        @Res() res:Response,
    ) {
        const result = await this.teamsService.modifyTeamActivity(teamId, actId, modifyAct, req.user);
        AddTraceIdToResponse(result, req);
        return res.status(HttpStatus.OK).json(result);
    }

    @ApiOperation({
        summary: '取得活動列表',
        description: '取得活動列表',
    })
    @ApiResponse({
        description: '成功或失敗',
        type: TeamActivitiesRes,
    })
    @ApiParam({name: 'id', description: '球隊ID', required: true})
    @Get('activities/:id')
    async getActivities(
        @Param('id') teamId: string,
        @Query() dates:DateRangeQueryReqDto,
        @Req() req:Request,
        @Res() res:Response,
    ){
        const result = await this.teamsService.getActivities(teamId, dates);
        AddTraceIdToResponse(result, req);
        return res.status(HttpStatus.OK).json(result);
    }

    @ApiOperation({
        summary: '查詢球隊活動(最近三個月的)',
        description: '查詢球隊活動(最近三個月的)',
    })
    @ApiResponse({
        description: '成功或失敗',
        type: TeamActivitiesRes,
    })
    @ApiParam({name: 'id', description: '球隊ID', required: true})
    @Get('activities/last/:id')
    async getActivitiesLastThreeMonths(
        @Param('id') teamId: string,
        @Req() req:Request,
        @Res() res:Response,
    ){
        const result = await this.teamsService.getActivitiesLastThreeMonths(teamId);
        AddTraceIdToResponse(result, req);
        return res.status(HttpStatus.OK).json(result);
    }

    @ApiOperation({
        summary: '取得活動參與者列表',
        description: '取得活動參與者列表',
    })
    @ApiResponse({
        description: '成功或失敗',
        type: ActivityParticipantsResponse,
    })
    @ApiParam({name: 'activityId', description: '球隊活動ID', required: true})
    @Get('activities/participants/:activityId')
    async getActivityParticipants(
        @Param('activityId') activityId: string,
        @Req() req:Request,
        @Res() res:Response,
    ){
        const result = await this.teamsService.getActivityParticipants(activityId);
        AddTraceIdToResponse(result, req);
        return res.status(HttpStatus.OK).json(result);
    }

    @ApiOperation({
        summary: '隊員報名參加活動',
        description: '隊員報名參加活動',
    })
    @ApiResponse({
        description: '成功或失敗',
        type: ActivityParticipantsResponse,
    })
    @ApiParam({name: 'id', description: '球隊ID', required: true})
    @ApiParam({name: 'activityId', description: '球隊活動ID', required: true})
    @Get('activities/join/:id/:activityId')
    async joinActivity(
        @Param('id') teamId: string,
        @Param('activityId') activityId: string,
        @Req() req:any,
        @Res() res:Response,
    ){
        const result = await this.teamsService.joinActivity(teamId, activityId, req.user);
        AddTraceIdToResponse(result, req);
        return res.status(HttpStatus.OK).json(result);
    }

    @ApiOperation({
        summary: '隊員退出活動',
        description: '隊員退出活動',
    })
    @ApiResponse({
        description: '成功或失敗',
        type: ActivityParticipantsResponse,
    })
    @ApiParam({name: 'id', description: '球隊ID', required: true})
    @ApiParam({name: 'activityId', description: '球隊活動ID', required: true})
    @Get('activities/leave/:id/:activityId')
    async leaveActivity(
        @Param('id') teamId: string,
        @Param('activityId') activityId: string,
        @Req() req:any,
        @Res() res:Response,
    ){
        const result = await this.teamsService.leaveActivity(teamId, activityId, req.user);
        AddTraceIdToResponse(result, req);
        return res.status(HttpStatus.OK).json(result);
    } 
    @ApiOperation({
        summary: '查詢球隊公告(最近三個月的)',
        description: '查詢球隊公告(最近三個月的)',
    })
    @ApiResponse({
        description: '成功或失敗',
        type: AnnouncementsResponseDto,
    })
    @ApiParam({name: 'id', description: '球隊ID', required:true})
    @Get('announcements/:id')
    async announcementsGet(
        @Param('id') teamId: string,
        @Req() req: Request,
        @Res() res: Response,
    ) {
        const annRes = await this.teamsService.announcementsGet(teamId);
        AddTraceIdToResponse(annRes, req);
        return res.status(HttpStatus.OK).json(annRes);
    }
    @ApiOperation({
        summary: '新增公告',
        description: '',
    })
    @ApiResponse({
        description: '成功或失敗',
        type: CommonResponseDto,
    })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        description: '公告內容及上傳檔案',
        type: TeamAnnouncementCreateDto,
    })
    @ApiParam({name: 'id', description: '球隊ID', required:true})
    @UseInterceptors(AnyFilesInterceptor())
    @Post('announcements/:id')
    async announcementsPost(
        @Param('id') teamId:string,
        @Body(BadWordsPipe) announcementCreateDto: TeamAnnouncementCreateDto,
        @UploadedFiles() files: Array<Express.Multer.File>,
        @Req() req: any,
        @Res() res: Response,
    ) {
        const comRes = await this.teamsService.announcementsPost(
            teamId,
            req.user,
            announcementCreateDto,
            files,
        );
        AddTraceIdToResponse(comRes, req);
        return res.status(HttpStatus.OK).json(comRes);
    }

    @ApiOperation({
        summary: '更新公告',
        description: '',
    })
    @ApiResponse({
        description: '成功或失敗',
        type: CommonResponseDto,
    })
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(AnyFilesInterceptor())
    @ApiParam({name: 'id', description: '球隊ID', required:true})
    @ApiParam({name: 'annId', description: '公告ID', required:true})
    @Put('announcements/:id/:annId')
    async announcementsIdPut(
        @Param('id') teamId: string,
        @Param('annId') annId: string,
        @Body(BadWordsPipe) announceUpdateDto: TeamAnnouncementModifyDto,
        @UploadedFiles() files: Array<Express.Multer.File>,
        @Req() req: any,
        @Res() res: Response,
    ) {
        const comRes = await this.teamsService.announcementsIdPut(
            teamId,
            req.user,
            annId,
            announceUpdateDto,
            files,
        );
        AddTraceIdToResponse(comRes, req);
        return res.status(HttpStatus.OK).json(comRes);
    }

    @ApiOperation({
        summary: '刪除公告',
        description: '刪除公告',
    })
    @ApiResponse({
        description: '成功或失敗',
        type: CommonResponseDto,
    })
    @ApiParam({name: 'id', description: '球隊ID', required:true})
    @ApiParam({name: 'annId', description: '公告ID', required:true})
    @Delete('announcements/:id/:annId')
    async announcementsDel(
        @Param('id') teamId: string,
        @Param('annId') annId: string,
        @Req() req:Request,
        @Res() res: Response,
    ) {
        const comRes = await this.teamsService.announcementsDel(
            teamId,
            annId,
        );
        AddTraceIdToResponse(comRes, req);
        return res.status(HttpStatus.OK).json(comRes);
    }
    @Delete('teammember/reformdata')
    async reformTeamMemberData(
        @Res() res: Response,
    ) {
        const comRes = await this.teamsService.reformTeamMemberData();
        return res.status(HttpStatus.OK).json(comRes);
    }    
}