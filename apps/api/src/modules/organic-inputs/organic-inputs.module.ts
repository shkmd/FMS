import { Module } from "@nestjs/common";
import { OrganicInputsController } from "./organic-inputs.controller";
import { OrganicInputsService } from "./organic-inputs.service";

@Module({
  controllers: [OrganicInputsController],
  providers: [OrganicInputsService],
})
export class OrganicInputsModule {}
