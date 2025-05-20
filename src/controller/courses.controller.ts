import { Controller, Req, Res, HttpStatus,
    Get,
} from '@nestjs/common';
import { CoursesService } from '../service/courses.service';
import { Request, Response } from 'express';
import {
  ApiResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CoursesResponseDto } from  "../dto/courses-response.dto";

@Controller('courses')
@ApiTags('courses')
export class CoursesController {
   constructor(private readonly coursesService: CoursesService) {}

  @ApiOperation({
    summary: '取得球場資訊',
    description: '',
  })
  @ApiResponse({
    description: '成功或失敗',
    type: CoursesResponseDto
  })
  @Get('')
  async coursesGet(
      
      @Req() req: Request,
      @Res() res: Response)
      {

      await this.coursesService.coursesGet( req)

      return res.status(HttpStatus.OK).json(new CoursesResponseDto())
    }

}
