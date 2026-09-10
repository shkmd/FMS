import { Module } from "@nestjs/common";
import { ProcessingController } from "./processing.controller";
import { ProcessingService } from "./processing.service";
import { InventoryModule } from "../inventory/inventory.module";

@Module({
  imports: [InventoryModule],
  controllers: [ProcessingController],
  providers: [ProcessingService],
})
export class ProcessingModule {}
