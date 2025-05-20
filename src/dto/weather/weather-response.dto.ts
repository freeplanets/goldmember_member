import { ApiProperty } from "@nestjs/swagger";
import { CommonResponseDto } from "../common/common-response.dto";
import { ICommonResponse } from "../interface/common.if";
import { WeatherData } from "./weather.data";

export class WeatherResponseDto extends CommonResponseDto implements ICommonResponse<WeatherData> {
    @ApiProperty({
        description: '天氣資訊',
        type: WeatherData,
    })
    data?: WeatherData;
}