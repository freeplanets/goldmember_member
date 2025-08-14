import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { SocialContorller } from '../controller/social.controller';
import { Member, MemberSchema } from '../dto/schemas/member.schema';
import { SocialService } from '../service/social.service';
import { Friend, FriendSchema } from '../dto/schemas/friend.schema';
import { LoginToken, LoginTokenSchema } from '../dto/schemas/login-token.schema';

@Module({
    imports: [
        JwtModule,
        MongooseModule.forFeature([
            {name: LoginToken.name, schema: LoginTokenSchema},
            {name: Member.name, schema: MemberSchema},
            {name: Friend.name, schema: FriendSchema},
        ])
    ],
    controllers: [SocialContorller],
    providers: [SocialService],
})
export class SocialModuel {}