import type { INestApplication } from "@nestjs/common";
import request from "supertest";
import * as bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { PERMISSIONS } from "@fms/shared";
import { createTestApp } from "./utils/test-app";

const prisma = new PrismaClient();

/**
 * End-to-end coverage of spec §5.2/§5.3's core promise: a worker can't be double-booked, and moving an
 * actively-assigned worker requires an approved reassignment request that preserves history and audit.
 */
describe("Task assignment & reassignment (e2e)", () => {
  let app: INestApplication;
  const suffix = Date.now();
  let token: string;
  let farmId: string;
  let farmAreaId: string;
  let workerId: string;
  let task1Id: string;
  let task2Id: string;

  beforeAll(async () => {
    app = await createTestApp();

    const permissionCodes = [
      PERMISSIONS.FARM_MANAGE,
      PERMISSIONS.TASK_CREATE,
      PERMISSIONS.TASK_SUBMIT,
      PERMISSIONS.TASK_APPROVE,
      PERMISSIONS.TASK_APPROVE_CRITICAL,
      PERMISSIONS.TASK_ASSIGN,
      PERMISSIONS.LABOUR_ALLOCATE,
      PERMISSIONS.REASSIGNMENT_REQUEST,
      PERMISSIONS.REASSIGNMENT_APPROVE,
      PERMISSIONS.EMPLOYEE_MANAGE,
    ];
    const permissions = await Promise.all(
      permissionCodes.map((code) =>
        prisma.permission.upsert({ where: { code }, create: { code, module: code.split(":")[0] }, update: {} }),
      ),
    );
    const role = await prisma.role.create({ data: { code: `E2E_ROLE_${suffix}`, name: "E2E Test Role" } });
    await prisma.rolePermission.createMany({ data: permissions.map((p) => ({ roleId: role.id, permissionId: p.id })) });

    const passwordHash = await bcrypt.hash("Demo@1234", 10);
    const user = await prisma.user.create({ data: { email: `reassign-e2e-${suffix}@athachifarms.demo`, name: "E2E Coordinator", passwordHash } });
    await prisma.userRole.create({ data: { userId: user.id, roleId: role.id } });

    const farm = await prisma.farm.create({ data: { name: `E2E Farm ${suffix}`, code: `E2EFARM${suffix}` } });
    farmId = farm.id;
    const farmArea = await prisma.farmArea.create({ data: { farmId, name: "E2E Plot", code: `E2E-P-${suffix}`, type: "PLOT" } });
    farmAreaId = farmArea.id;

    const employee = await prisma.employee.create({
      data: { farmId, employeeCode: `E2E-EMP-${suffix}`, name: "E2E Worker", employmentCategory: "DAILY_WAGE" },
    });
    const worker = await prisma.worker.create({ data: { employeeId: employee.id } });
    workerId = worker.id;

    const login = await request(app.getHttpServer())
      .post("/api/auth/login")
      .send({ email: user.email, password: "Demo@1234" })
      .expect(200);
    token = login.body.accessToken;
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  const authed = {
    get: (url: string) => request(app.getHttpServer()).get(url).set("Authorization", `Bearer ${token}`),
    post: (url: string) => request(app.getHttpServer()).post(url).set("Authorization", `Bearer ${token}`),
    patch: (url: string) => request(app.getHttpServer()).patch(url).set("Authorization", `Bearer ${token}`),
  };

  it("creates and approves two same-day, overlapping-time tasks", async () => {
    const date = "2026-04-01";
    const base = {
      date,
      farmAreaId,
      category: "Weeding",
      plannedStart: "2026-04-01T08:00:00.000Z",
      plannedEnd: "2026-04-01T12:00:00.000Z",
    };

    const t1 = await authed.post("/api/tasks").send({ ...base, description: "Task 1" }).expect(201);
    const t2 = await authed.post("/api/tasks").send({ ...base, description: "Task 2" }).expect(201);
    task1Id = t1.body.id;
    task2Id = t2.body.id;

    for (const id of [task1Id, task2Id]) {
      await authed.post(`/api/tasks/${id}/submit`).expect(201);
      await authed.post(`/api/tasks/${id}/approve`).expect(201);
    }
  });

  it("assigns the worker to task 1", async () => {
    const res = await authed.post(`/api/tasks/${task1Id}/assignments`).send({ workerId }).expect(201);
    expect(res.body.assignments.some((a: any) => a.workerId === workerId && a.isActive)).toBe(true);
    expect(res.body.status).toBe("ASSIGNED");
  });

  it("rejects a direct overlapping assignment to task 2", async () => {
    const res = await authed.post(`/api/tasks/${task2Id}/assignments`).send({ workerId }).expect(409);
    expect(res.body.message).toMatch(/already actively assigned/i);
  });

  it("rejects a reassignment request for a worker who isn't actively assigned to the source task", async () => {
    await authed
      .post("/api/reassignment-requests")
      .send({ workerId, fromTaskId: task2Id, toTaskId: task1Id, reason: "bogus" })
      .expect(400);
  });

  let requestId: string;

  it("creates a reassignment request moving the worker from task 1 to task 2", async () => {
    const res = await authed
      .post("/api/reassignment-requests")
      .send({ workerId, fromTaskId: task1Id, toTaskId: task2Id, reason: "Urgent need on task 2", urgency: "URGENT" })
      .expect(201);
    requestId = res.body.id;
    expect(res.body.status).toBe("PENDING");
  });

  it("approving the request moves the worker and preserves assignment history", async () => {
    await authed.patch(`/api/reassignment-requests/${requestId}/decide`).send({ approve: true }).expect(200);

    const task1 = await authed.get(`/api/tasks/${task1Id}`).expect(200);
    const task2 = await authed.get(`/api/tasks/${task2Id}`).expect(200);

    const oldAssignment = task1.body.assignments.find((a: any) => a.workerId === workerId);
    expect(oldAssignment.isActive).toBe(false);
    expect(oldAssignment.unassignedAt).not.toBeNull();

    const newAssignment = task2.body.assignments.find((a: any) => a.workerId === workerId);
    expect(newAssignment.isActive).toBe(true);
  });

  it("recorded an audit trail entry for the approved reassignment", async () => {
    const logs = await prisma.auditLog.findMany({ where: { entityType: "ReassignmentRequest", entityId: requestId } });
    expect(logs.some((l) => l.action === "APPROVE")).toBe(true);
  });

  it("rejects deciding the same request twice", async () => {
    await authed.patch(`/api/reassignment-requests/${requestId}/decide`).send({ approve: true }).expect(400);
  });
});
