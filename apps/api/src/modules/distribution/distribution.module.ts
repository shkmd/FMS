import { Module } from "@nestjs/common";
import { DistributionController } from "./distribution.controller";
import { DistributionService } from "./distribution.service";
import { InventoryModule } from "../inventory/inventory.module";

@Module({
  imports: [InventoryModule],
  controllers: [DistributionController],
  providers: [DistributionService],
})
export class DistributionModule {}
