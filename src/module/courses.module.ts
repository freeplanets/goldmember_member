import { Module } from '@nestjs/common';
import { CoursesController } from '../controller/courses.controller';
import { CoursesService } from '../service/courses.service';

@Module({
  imports: [],
  controllers: [CoursesController],
  providers: [CoursesService],
})
export class CoursesModule {}
