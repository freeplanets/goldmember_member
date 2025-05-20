/**
 * curl -X 'GET' \
  'https://opendata.cwa.gov.tw/api/v1/rest/datastore/O-A0001-001?Authorization=CWA-3CE52E28-FD47-4088-A484-93FE39E3043C&limit=10&StationName=%E6%9E%97%E5%8F%A3&WeatherElement=&GeoInfo=TownName' \
  -H 'accept: application/json'
 */

import axios, { AxiosRequestConfig,  } from "axios";
import { GEO_INFO, WEATHER_ELEMENT } from "./weather-enum";
import { IParamsOfWeather, IWeatherCommonResponse, IWeatherResponse, IWeekWeatherResponse } from "./weather-if";

export class WeatherInfo {
    private url = 'https://opendata.cwa.gov.tw/api/v1/rest/datastore/O-A0001-001';
    private urlWeek = 'https://opendata.cwa.gov.tw/api/v1/rest/datastore/F-D0047-071';
    private opt:IParamsOfWeather = {
        Authorization: process.env.CWA_KEY,
        StationId: 'C0AH50',    //林口
        GeoInfo: GEO_INFO.TOWN_NAME,
        // WeatherElement: WEATHER_ELEMENT.WEATHER,
    }
    private optWeek:IParamsOfWeather = {
        Authorization: process.env.CWA_KEY,
        format: 'JSON',    //
        LocationName:'新北市,林口區',
        ElementName:'最高溫度,最低溫度,天氣現象',
    }
    get Url() {
        return this.url;   
    }
    get UrlWeek() {
        return this.urlWeek;   
    }
    get Opt() {
        return this.opt;   
    }
    get OptWeek() {
        return this.optWeek;   
    }
    async getRecords(url:string = this.url , opt:IParamsOfWeather = this.opt) {
        const config:AxiosRequestConfig = {
            headers: {
                "Accept" : "application/json",
            }
        }
        const param = Object.keys(opt).map((key) => `${key}=${encodeURIComponent(opt[key])}`);
        const uri = `${url}?${param.join('&')}`;
        console.log('getRecords url:', uri);
        try {
            const res = await axios.get(uri, config);
            const data:IWeatherCommonResponse = res.data;
            // console.log("Weather response:", data);
            if (data.success == 'true') {
                //return data.records.Station;
                return data;
            }
        } catch (err) {
            console.log("get Weather error:", err);
        }
        return false;

    }
}
