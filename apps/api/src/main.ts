import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { AppModule } from "./app.module";
import { AllExceptionsFilter } from "./common/filters/all-exceptions.filter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: false });

  app.use(helmet());
  app.use(cookieParser());
  app.setGlobalPrefix("api");
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: false }));
  app.useGlobalFilters(new AllExceptionsFilter());

  app.enableCors({
    origin: process.env.API_CORS_ORIGIN?.split(",") ?? "http://localhost:3000",
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle("Athachi Farms FMS API")
    .setDescription("Farm management system for Athachi Farms — Milestone 1")
    .setVersion("0.1.0")
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document);

  const port = process.env.API_PORT ? Number(process.env.API_PORT) : 4000;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`Athachi Farms FMS API listening on http://localhost:${port}/api (docs at /api/docs)`);
}

bootstrap();
