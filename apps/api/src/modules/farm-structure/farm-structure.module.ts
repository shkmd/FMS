import { Module } from "@nestjs/common";
import { FarmStructureController } from "./farm-structure.controller";
import { FarmStructureService } from "./farm-structure.service";

@Module({
  controllers: [FarmStructureController],
  providers: [FarmStructureService],
  exports: [FarmStructureService],
})
export class FarmStructureModule {}
