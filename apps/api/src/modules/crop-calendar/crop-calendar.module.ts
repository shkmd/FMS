import { Module } from "@nestjs/common";
import { CropCalendarController } from "./crop-calendar.controller";
import { CropCalendarService } from "./crop-calendar.service";
import { TasksModule } from "../tasks/tasks.module";

@Module({
  imports: [TasksModule],
  controllers: [CropCalendarController],
  providers: [CropCalendarService],
})
export class CropCalendarModule {}
