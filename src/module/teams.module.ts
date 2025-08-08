import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Team, TeamSchema } from '../dto/schemas/team.schema';
import { TeamMemberSchema, TeamMember } from '../dto/schemas/team-member.schema';
import { TeamsController } from '../controller/teams.controller';
import { Member, MemberSchema } from '../dto/schemas/member.schema';
import { JwtModule } from '@nestjs/jwt';
import { LoginToken, LoginTokenSchema } from '../dto/schemas/login-token.schema';
import { TeamActivity, TeamActivitySchema } from '../dto/schemas/team-activity.schema';
import { TeamsService } from '../service/teams.service';
import { CreditRecord, CreditRecordSchema } from '../dto/schemas/credit-record.schema';

@Module({
    imports: [
        JwtModule,
        MongooseModule.forFeature([
            { name: Team.name, schema: TeamSchema },
            { name: TeamMember.name, schema: TeamMemberSchema },
            { name: Member.name, schema: MemberSchema},
            { name: CreditRecord.name, schema: CreditRecordSchema},
            { name: LoginToken.name, schema: LoginTokenSchema},
            { name: TeamActivity.name, schema: TeamActivitySchema},
            //{ name: KsMembe.name, schema: KsMemberSchema},
        ]),
    ],
    controllers: [TeamsController],
    providers: [TeamsService],
})
export class TeamsModule {}