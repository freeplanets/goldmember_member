import { ApiProperty } from "@nestjs/swagger";
import { IReservations, IReserveSection } from "../interface/reservations.if";
import { IsArray, IsNumber, IsObject, IsOptional, IsString } from "class-validator";
import { ReserveSectionDto } from "./reserve-section.dto";

export class TeamReserveReqDto implements Partial<IReservations> {
    @ApiProperty({
        description: '球隊 ID',
        required: true,
    })
    teamId:string;  //球隊 ID (球隊預約時使用)

    @ApiProperty({
        description: '球隊名稱',
        required: true,
    })
    teamName:string;    //球隊名稱 (球隊預約時使用)

    @ApiProperty({
        description: '聯絡人姓名',
        required: true,
    })
    contactPerson:string;   //聯絡人姓名

    @ApiProperty({
        description: '聯絡人電話',
        required: true,
    })
    contactPhone:string;    //聯絡人電話

    @ApiProperty({
        description: '參與人數',
        required: false,
    })
    @IsOptional()
    @IsNumber()
    playerCount:number; //參與人數 (個人預約時使用)

    @ApiProperty({
        description: '參與人員名單',
        required: false,
    })
    participants:any;    //參與人員名單 (個人預約時使用)

    @ApiProperty({
        description: '組數',
        required: false,
    })
    @IsOptional()
    @IsNumber()
    groups:number;  //組數

    @ApiProperty({
        description: '預約時段資料',
        required: true,
        type: ReserveSectionDto,
        isArray: true,
    })
    @IsArray()
    @IsObject({each: true})
    data:Partial<IReserveSection>[];   //預約時段資料

    @ApiProperty({
        description: '備註',
        required: false,
    })
    @IsOptional()
    @IsString()
    notes:string;   //備註
}