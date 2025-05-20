import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { MongooseModule } from "@nestjs/mongoose";
import { DevicesController } from "../controller/devices.controller";
import { Member, MemberSchema } from "../dto/schemas/member.schema";
import { DevicesService } from "../service/devices.service";
import { LoginToken, LoginTokenSchema } from "../dto/schemas/login-token.schema";

@Module({
    imports: [
        JwtModule,
        MongooseModule.forFeature([
            {name: Member.name, schema: MemberSchema},
            {name: LoginToken.name, schema: LoginTokenSchema}
        ])
    ],
    controllers:[DevicesController],
    providers:[DevicesService],
})
export class DevicesModule {}