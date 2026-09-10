import { Module } from "@nestjs/common";
import { PlantHealthController } from "./plant-health.controller";
import { PlantHealthService } from "./plant-health.service";

@Module({
  controllers: [PlantHealthController],
  providers: [PlantHealthService],
})
export class PlantHealthModule {}
