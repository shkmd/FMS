import type { INestApplication } from "@nestjs/common";
import request from "supertest";
import * as bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { createTestApp } from "./utils/test-app";

const prisma = new PrismaClient();

describe("Auth (e2e)", () => {
  let app: INestApplication;
  const email = `auth-e2e-${Date.now()}@athachifarms.demo`;
  const password = "Demo@1234";

  beforeAll(async () => {
    app = await createTestApp();
    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.user.create({ data: { email, name: "E2E Auth User", passwordHash } });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email } });
    await prisma.$disconnect();
    await app.close();
  });

  it("rejects an unknown email", async () => {
    await request(app.getHttpServer())
      .post("/api/auth/login")
      .send({ email: "nope@athachifarms.demo", password: "whatever1" })
      .expect(401);
  });

  it("rejects the wrong password", async () => {
    await request(app.getHttpServer()).post("/api/auth/login").send({ email, password: "wrongpass1" }).expect(401);
  });

  it("logs in with correct credentials and returns an access token", async () => {
    const res = await request(app.getHttpServer()).post("/api/auth/login").send({ email, password }).expect(200);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.user.email).toBe(email);
    expect(res.headers["set-cookie"]).toBeDefined();
  });

  it("rejects /auth/me without a token", async () => {
    await request(app.getHttpServer()).get("/api/auth/me").expect(401);
  });

  it("returns the current user profile with a valid token", async () => {
    const login = await request(app.getHttpServer()).post("/api/auth/login").send({ email, password }).expect(200);
    const res = await request(app.getHttpServer())
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${login.body.accessToken}`)
      .expect(200);
    expect(res.body.email).toBe(email);
  });
});
