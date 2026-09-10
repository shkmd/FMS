import { Module } from "@nestjs/common";
import { RndController } from "./rnd.controller";
import { RndService } from "./rnd.service";

@Module({
  controllers: [RndController],
  providers: [RndService],
})
export class RndModule {}
