import { Module } from "@nestjs/common";
import { HarvestController } from "./harvest.controller";
import { HarvestService } from "./harvest.service";
import { InventoryModule } from "../inventory/inventory.module";

@Module({
  imports: [InventoryModule],
  controllers: [HarvestController],
  providers: [HarvestService],
  exports: [HarvestService],
})
export class HarvestModule {}
