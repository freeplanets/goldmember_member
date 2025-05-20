import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Announcement, AnnouncementSchema } from '../dto/schemas/announcement.schema';
import { JwtModule } from '@nestjs/jwt';
import { Announcement2Member, Announcement2MemberSchema } from '../dto/schemas/announcent2member.schema';
import { Member, MemberSchema } from '../dto/schemas/member.schema';
import { AnnouncementsController } from '../controller/announcements.controller';
import { AnnouncementsService } from '../service/announcements.service';
import { LoginToken, LoginTokenSchema } from '../dto/schemas/login-token.schema';

@Module({
  imports: [
    JwtModule,
    MongooseModule.forFeature([
      {name: Announcement.name, schema: AnnouncementSchema},
      {name: Announcement2Member.name, schema: Announcement2MemberSchema},
      {name: Member.name, schema: MemberSchema},
      {name: LoginToken.name, schema: LoginTokenSchema},
    ])
  ],
  controllers: [AnnouncementsController],
  providers: [AnnouncementsService],
})
export class AnnouncementsModule {}
