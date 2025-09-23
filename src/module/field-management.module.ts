import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { LoginToken, LoginTokenSchema } from '../dto/schemas/login-token.schema';
import { GreenSpeeds, GreenSpeedsSchema } from '../dto/schemas/green-speeds.schema';
import { FieldManagementController } from '../controller/field-management.controller';
import { FieldManagementService } from '../service/field-management.service';

@Module({
    imports: [
        JwtModule,
        MongooseModule.forFeature([
            {name:LoginToken.name, schema:LoginTokenSchema},
            {name:GreenSpeeds.name, schema:GreenSpeedsSchema},
        ])
    ],
    controllers: [FieldManagementController],
    providers: [FieldManagementService],
})
export class FieldManagementModule {}