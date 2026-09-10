import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import cookieParser from "cookie-parser";
import { AppModule } from "../../src/app.module";
import { AllExceptionsFilter } from "../../src/common/filters/all-exceptions.filter";

export async function createTestApp(): Promise<INestApplication> {
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
  const app = moduleRef.createNestApplication();
  app.use(cookieParser());
  app.setGlobalPrefix("api");
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new AllExceptionsFilter());
  await app.init();
  return app;
}
