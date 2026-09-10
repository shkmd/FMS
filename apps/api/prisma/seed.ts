import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import { PERMISSIONS, ROLE_PERMISSIONS, RoleCode } from "@fms/shared";
import { dateOnly } from "../src/common/util/date-only";

const prisma = new PrismaClient();

const DEMO_PASSWORD = "Demo@1234";

const ROLE_NAMES: Record<RoleCode, string> = {
  SUPER_ADMIN: "Super Admin",
  TOP_MANAGEMENT: "Top Management",
  FARM_MANAGER: "Farm Manager",
  CHIEF_COORDINATOR: "Chief Coordinator",
  FARM_OFFICER: "Farm Officer / Administration",
  SENIOR_RESEARCH_OFFICER: "Senior Research Officer",
  PLOT_SUPERVISOR: "Plot Supervisor",
  GARDEN_SUPERVISOR: "Garden Supervisor",
  FIELD_INSPECTOR: "Field Inspector / Photographer",
  DISTRIBUTION_INCHARGE: "Distribution In-Charge",
  DAIRY_RND_ASSISTANT: "Dairy / R&D Assistant",
  WORKER: "Worker",
  AUDITOR: "Auditor / Certification Reviewer",
};

async function seedRbac() {
  const codes = Object.values(PERMISSIONS);
  for (const code of codes) {
    await prisma.permission.upsert({
      where: { code },
      create: { code, module: code.split(":")[0] },
      update: {},
    });
  }

  const roleIdByCode = new Map<string, string>();
  for (const roleCode of Object.keys(ROLE_PERMISSIONS) as RoleCode[]) {
    const role = await prisma.role.upsert({
      where: { code: roleCode },
      create: { code: roleCode, name: ROLE_NAMES[roleCode], isSystem: true },
      update: { name: ROLE_NAMES[roleCode] },
    });
    roleIdByCode.set(roleCode, role.id);

    const permissionCodes = ROLE_PERMISSIONS[roleCode];
    const permissions = await prisma.permission.findMany({ where: { code: { in: permissionCodes } } });
    await prisma.rolePermission.deleteMany({ where: { roleId: role.id } });
    await prisma.rolePermission.createMany({
      data: permissions.map((p) => ({ roleId: role.id, permissionId: p.id })),
    });
  }
  return roleIdByCode;
}

async function createUser(params: {
  email: string;
  name: string;
  roleCode: RoleCode;
  roleIdByCode: Map<string, string>;
  farmAreaIds?: string[];
}) {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const user = await prisma.user.upsert({
    where: { email: params.email },
    create: { email: params.email, name: params.name, passwordHash },
    update: { name: params.name },
  });
  const roleId = params.roleIdByCode.get(params.roleCode)!;
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: user.id, roleId } },
    create: { userId: user.id, roleId },
    update: {},
  });
  if (params.farmAreaIds?.length) {
    await prisma.userAreaAccess.deleteMany({ where: { userId: user.id } });
    await prisma.userAreaAccess.createMany({
      data: params.farmAreaIds.map((farmAreaId) => ({ userId: user.id, farmAreaId })),
      skipDuplicates: true,
    });
  }
  return user;
}

async function main() {
  console.log("Seeding RBAC (permissions, roles)…");
  const roleIdByCode = await seedRbac();

  console.log("Seeding farm structure…");
  const farm = await prisma.farm.upsert({
    where: { code: "ATHACHI" },
    create: { name: "Athachi Farms", code: "ATHACHI", totalArea: 20, areaUnit: "acre", address: "Kerala, India" },
    update: {},
  });

  const farmAreaDefs: { code: string; name: string; type: any }[] = [
    { code: "PLOT-A", name: "Plot A", type: "PLOT" },
    { code: "PLOT-B", name: "Plot B", type: "PLOT" },
    { code: "PLOT-C", name: "Plot C", type: "PLOT" },
    { code: "NURSERY", name: "Nursery", type: "NURSERY" },
    { code: "RAIN-SHELTER", name: "Rain Shelter", type: "RAIN_SHELTER" },
    { code: "KITCHEN-GARDEN", name: "Kitchen Garden", type: "GARDEN_ZONE" },
    { code: "NAKSHATRA-VANAM", name: "Nakshatra Vanam", type: "GARDEN_ZONE" },
    { code: "NAVAGRAHA-VANAM", name: "Navagraha Vanam", type: "GARDEN_ZONE" },
    { code: "HERBAL-GARDEN", name: "Herbal Garden", type: "GARDEN_ZONE" },
    { code: "FARMHOUSE-GARDEN", name: "Farmhouse Garden", type: "GARDEN_ZONE" },
    { code: "SCHOOL-GARDEN", name: "School Garden", type: "GARDEN_ZONE" },
    { code: "DAIRY", name: "Dairy Unit", type: "DAIRY" },
    { code: "PROCESSING", name: "Processing Area", type: "PROCESSING_UNIT" },
    { code: "SEED-STORE", name: "Seed Store", type: "STORE" },
    { code: "GENERAL-STORE", name: "General Store", type: "STORE" },
  ];

  const farmAreas: Record<string, { id: string }> = {};
  // A rough schematic layout around Athachi Farms so the map view has something plausible to render.
  const baseLat = 10.5276;
  const baseLng = 76.2144;
  let i = 0;
  for (const def of farmAreaDefs) {
    const row = Math.floor(i / 4);
    const col = i % 4;
    const centerLat = baseLat + row * 0.0009;
    const centerLng = baseLng + col * 0.0011;
    const area = await prisma.farmArea.upsert({
      where: { farmId_code: { farmId: farm.id, code: def.code } },
      create: {
        farmId: farm.id,
        code: def.code,
        name: def.name,
        type: def.type,
        areaUnit: "acre",
        areaSize: def.type === "PLOT" ? 5 : 0.5,
        centerLat,
        centerLng,
        boundary: {
          type: "Polygon",
          coordinates: [
            [
              [centerLng - 0.0006, centerLat - 0.0004],
              [centerLng + 0.0006, centerLat - 0.0004],
              [centerLng + 0.0006, centerLat + 0.0004],
              [centerLng - 0.0006, centerLat + 0.0004],
              [centerLng - 0.0006, centerLat - 0.0004],
            ],
          ],
        },
        status: "ACTIVE",
      },
      update: {},
    });
    farmAreas[def.code] = area;
    i++;
  }

  const plotA = await prisma.plot.upsert({
    where: { farmId_code: { farmId: farm.id, code: "A" } },
    create: { farmId: farm.id, farmAreaId: farmAreas["PLOT-A"].id, code: "A", name: "Plot A", totalArea: 6 },
    update: {},
  });
  const plotB = await prisma.plot.upsert({
    where: { farmId_code: { farmId: farm.id, code: "B" } },
    create: { farmId: farm.id, farmAreaId: farmAreas["PLOT-B"].id, code: "B", name: "Plot B", totalArea: 8 },
    update: {},
  });
  const plotC = await prisma.plot.upsert({
    where: { farmId_code: { farmId: farm.id, code: "C" } },
    create: { farmId: farm.id, farmAreaId: farmAreas["PLOT-C"].id, code: "C", name: "Plot C", totalArea: 6 },
    update: {},
  });

  const subPlots = [];
  for (let n = 1; n <= 12; n++) {
    const code = `B${n}`;
    const sp = await prisma.subPlot.upsert({
      where: { plotId_code: { plotId: plotB.id, code } },
      create: { plotId: plotB.id, code, name: `Plot B - Sub-plot ${n}`, area: 8 / 12 },
      update: {},
    });
    subPlots.push(sp);
  }

  console.log("Seeding cultivation blocks & crops…");
  async function findOrCreateBlock(plotId: string, code: string, name: string, area: number, subPlotId?: string) {
    const existing = await prisma.cultivationBlock.findFirst({ where: { plotId, code } });
    if (existing) return existing;
    return prisma.cultivationBlock.create({ data: { plotId, subPlotId, code, name, area } });
  }
  const blockA1 = await findOrCreateBlock(plotA.id, "A-1", "Plot A Block 1", 2);
  const blockB1 = await findOrCreateBlock(plotB.id, "B1-1", "Sub-plot B1 Block 1", 0.5, subPlots[0].id);
  const blockC1 = await findOrCreateBlock(plotC.id, "C-1", "Plot C Block 1", 2);

  const rice = await prisma.crop.upsert({
    where: { name: "Rice" },
    create: { name: "Rice", category: "RICE", description: "47 native/experimental varieties under cultivation and trial at Athachi Farms." },
    update: {},
  });
  const riceVarietyNames: [string, "NATIVE" | "EXPERIMENTAL"][] = [
    ["Njavara", "NATIVE"],
    ["Rakthashali", "NATIVE"],
    ["Chittadi", "NATIVE"],
    ["Kalanamak", "NATIVE"],
    ["Gandhakasala", "NATIVE"],
    ["Athachi Trial Hybrid-1", "EXPERIMENTAL"],
  ];
  const riceVarieties = [];
  for (const [name, classification] of riceVarietyNames) {
    const v = await prisma.cropVariety.upsert({
      where: { cropId_name: { cropId: rice.id, name } },
      create: { cropId: rice.id, name, classification },
      update: {},
    });
    riceVarieties.push(v);
  }

  const ginger = await prisma.crop.upsert({
    where: { name: "Ginger" },
    create: { name: "Ginger", category: "SPICE" },
    update: {},
  });
  const gingerVariety = await prisma.cropVariety.upsert({
    where: { cropId_name: { cropId: ginger.id, name: "Rio-de-Janeiro" } },
    create: { cropId: ginger.id, name: "Rio-de-Janeiro", classification: "COMMERCIAL" },
    update: {},
  });

  const turmeric = await prisma.crop.upsert({
    where: { name: "Turmeric" },
    create: { name: "Turmeric", category: "SPICE" },
    update: {},
  });
  await prisma.cropVariety.upsert({
    where: { cropId_name: { cropId: turmeric.id, name: "Alleppey Finger" } },
    create: { cropId: turmeric.id, name: "Alleppey Finger", classification: "COMMERCIAL" },
    update: {},
  });

  await prisma.crop.upsert({ where: { name: "Banana" }, create: { name: "Banana", category: "FRUIT" }, update: {} });
  await prisma.crop.upsert({ where: { name: "Tomato" }, create: { name: "Tomato", category: "VEGETABLE" }, update: {} });
  await prisma.crop.upsert({ where: { name: "Brinjal" }, create: { name: "Brinjal", category: "VEGETABLE" }, update: {} });

  const riceCycle = await prisma.cropCycle.create({
    data: {
      farmId: farm.id,
      cultivationBlockId: blockA1.id,
      cropId: rice.id,
      varietyId: riceVarieties[0].id,
      stage: "VEGETATIVE_GROWTH",
      sownDate: new Date(Date.now() - 30 * 86400000),
      expectedHarvestStart: new Date(Date.now() + 60 * 86400000),
      expectedYield: 1800,
      yieldUnit: "kg",
    },
  });
  const gingerCycle = await prisma.cropCycle.create({
    data: {
      farmId: farm.id,
      cultivationBlockId: blockB1.id,
      cropId: ginger.id,
      varietyId: gingerVariety.id,
      stage: "NURSERY",
      expectedYield: 400,
      yieldUnit: "kg",
    },
  });
  void blockC1;

  console.log("Seeding skills…");
  const skillNames = [
    "Ploughing",
    "Irrigation",
    "Harvesting",
    "Pruning",
    "Spraying",
    "Weeding",
    "Machinery Operation",
    "Animal Care",
    "Nursery Handling",
    "Packing",
  ];
  const skills: Record<string, { id: string }> = {};
  for (const name of skillNames) {
    skills[name] = await prisma.skill.upsert({ where: { name }, create: { name }, update: {} });
  }

  console.log("Seeding departments & designations…");
  const departmentNames = ["Management", "Administration", "R&D", "Cultivation", "Landscape", "Quality", "Distribution", "Dairy", "Field Labour"];
  const departments: Record<string, Awaited<ReturnType<typeof prisma.department.upsert>>> = {};
  for (const name of departmentNames) {
    const code = name.toUpperCase().replace(/[^A-Z]+/g, "_");
    departments[name] = await prisma.department.upsert({
      where: { code },
      create: { farmId: farm.id, name, code },
      update: { name },
    });
  }

  const designationSeeds: { title: string; code: string; dept: string; grade: string }[] = [
    { title: "Farm Manager", code: "DESG-FARM-MGR", dept: "Management", grade: "L5" },
    { title: "Chief Coordinator", code: "DESG-CHIEF-COORD", dept: "Management", grade: "L4" },
    { title: "Farm Officer", code: "DESG-FARM-OFFICER", dept: "Administration", grade: "L3" },
    { title: "Senior Research Officer", code: "DESG-SR-RESEARCH", dept: "R&D", grade: "L4" },
    { title: "Plot Supervisor", code: "DESG-PLOT-SUP", dept: "Cultivation", grade: "L3" },
    { title: "Garden Supervisor", code: "DESG-GARDEN-SUP", dept: "Landscape", grade: "L3" },
    { title: "Field Inspector", code: "DESG-FIELD-INSPECTOR", dept: "Quality", grade: "L3" },
    { title: "Distribution In-Charge", code: "DESG-DIST-INCHARGE", dept: "Distribution", grade: "L3" },
    { title: "Dairy / R&D Assistant", code: "DESG-DAIRY-ASST", dept: "Dairy", grade: "L2" },
    { title: "Field Worker", code: "DESG-FIELD-WORKER", dept: "Field Labour", grade: "L1" },
  ];
  const designations: Record<string, Awaited<ReturnType<typeof prisma.designation.upsert>>> = {};
  for (const d of designationSeeds) {
    designations[d.title] = await prisma.designation.upsert({
      where: { code: d.code },
      create: { farmId: farm.id, title: d.title, code: d.code, grade: d.grade, departmentId: departments[d.dept].id },
      update: { departmentId: departments[d.dept].id },
    });
  }

  console.log("Seeding users, employees & workers…");
  const topManagement = await createUser({ email: "management@athachifarms.demo", name: "Radhakrishnan Nair", roleCode: "TOP_MANAGEMENT", roleIdByCode });
  const farmManager = await createUser({ email: "farmmanager@athachifarms.demo", name: "Suresh Kumar", roleCode: "FARM_MANAGER", roleIdByCode });
  const coordinator = await createUser({ email: "coordinator@athachifarms.demo", name: "Anitha Menon", roleCode: "CHIEF_COORDINATOR", roleIdByCode });
  const officer = await createUser({ email: "officer@athachifarms.demo", name: "Biju Thomas", roleCode: "FARM_OFFICER", roleIdByCode });
  const researchOfficer = await createUser({ email: "research@athachifarms.demo", name: "Dr. Lakshmi Pillai", roleCode: "SENIOR_RESEARCH_OFFICER", roleIdByCode });
  const supervisorA = await createUser({ email: "supervisor.a@athachifarms.demo", name: "Ravi Varma", roleCode: "PLOT_SUPERVISOR", roleIdByCode, farmAreaIds: [farmAreas["PLOT-A"].id] });
  const supervisorB = await createUser({ email: "supervisor.b@athachifarms.demo", name: "Manoj Pillai", roleCode: "PLOT_SUPERVISOR", roleIdByCode, farmAreaIds: [farmAreas["PLOT-B"].id] });
  const supervisorC = await createUser({ email: "supervisor.c@athachifarms.demo", name: "Deepa Krishnan", roleCode: "PLOT_SUPERVISOR", roleIdByCode, farmAreaIds: [farmAreas["PLOT-C"].id] });
  const gardenSupervisor = await createUser({
    email: "garden@athachifarms.demo",
    name: "Sunitha Raj",
    roleCode: "GARDEN_SUPERVISOR",
    roleIdByCode,
    farmAreaIds: [
      farmAreas["KITCHEN-GARDEN"].id,
      farmAreas["NAKSHATRA-VANAM"].id,
      farmAreas["NAVAGRAHA-VANAM"].id,
      farmAreas["HERBAL-GARDEN"].id,
      farmAreas["FARMHOUSE-GARDEN"].id,
      farmAreas["SCHOOL-GARDEN"].id,
    ],
  });
  const inspector = await createUser({ email: "inspector@athachifarms.demo", name: "Vishnu Prasad", roleCode: "FIELD_INSPECTOR", roleIdByCode });
  const distribution = await createUser({ email: "distribution@athachifarms.demo", name: "Geetha Nair", roleCode: "DISTRIBUTION_INCHARGE", roleIdByCode });
  const dairyAssistant = await createUser({ email: "dairy@athachifarms.demo", name: "Rajesh Kumar", roleCode: "DAIRY_RND_ASSISTANT", roleIdByCode });
  const auditor = await createUser({ email: "auditor@athachifarms.demo", name: "K. S. Menon", roleCode: "AUDITOR", roleIdByCode });
  const superAdmin = await createUser({ email: "admin@athachifarms.demo", name: "System Administrator", roleCode: "SUPER_ADMIN", roleIdByCode });
  // Requested by the user as a second, renameable Super Admin login — kept in seed so it survives resets.
  await createUser({ email: "admin2@athachifarms.demo", name: "Admin", roleCode: "SUPER_ADMIN", roleIdByCode });

  // Link a small management/supervisor cohort to Employee records so they show up as assignable staff.
  const staffUsers = [
    { user: farmManager, code: "EMP-001", dept: "Management", designation: "Farm Manager" },
    { user: coordinator, code: "EMP-002", dept: "Management", designation: "Chief Coordinator" },
    { user: officer, code: "EMP-003", dept: "Administration", designation: "Farm Officer" },
    { user: researchOfficer, code: "EMP-004", dept: "R&D", designation: "Senior Research Officer" },
    { user: supervisorA, code: "EMP-005", dept: "Cultivation", designation: "Plot Supervisor" },
    { user: supervisorB, code: "EMP-006", dept: "Cultivation", designation: "Plot Supervisor" },
    { user: supervisorC, code: "EMP-007", dept: "Cultivation", designation: "Plot Supervisor" },
    { user: gardenSupervisor, code: "EMP-008", dept: "Landscape", designation: "Garden Supervisor" },
    { user: inspector, code: "EMP-009", dept: "Quality", designation: "Field Inspector" },
    { user: distribution, code: "EMP-010", dept: "Distribution", designation: "Distribution In-Charge" },
    { user: dairyAssistant, code: "EMP-011", dept: "Dairy", designation: "Dairy / R&D Assistant" },
  ];
  const staffEmployees: Record<string, Awaited<ReturnType<typeof prisma.employee.upsert>>> = {};
  for (const s of staffUsers) {
    staffEmployees[s.code] = await prisma.employee.upsert({
      where: { employeeCode: s.code },
      create: {
        farmId: farm.id,
        userId: s.user.id,
        employeeCode: s.code,
        name: s.user.name,
        employmentCategory: "PERMANENT",
        departmentId: departments[s.dept].id,
        designationId: designations[s.designation].id,
        joinDate: new Date(Date.now() - 400 * 86400000),
      },
      update: { userId: s.user.id, departmentId: departments[s.dept].id, designationId: designations[s.designation].id },
    });
  }

  // One demo worker WITH login, to exercise the mobile "my tasks" screen end to end.
  const workerUser = await createUser({ email: "worker@athachifarms.demo", name: "Anil Kumar", roleCode: "WORKER", roleIdByCode });
  const workerEmployee = await prisma.employee.upsert({
    where: { employeeCode: "EMP-100" },
    create: {
      farmId: farm.id,
      userId: workerUser.id,
      employeeCode: "EMP-100",
      name: "Anil Kumar",
      employmentCategory: "DAILY_WAGE",
      departmentId: departments["Field Labour"].id,
      designationId: designations["Field Worker"].id,
      joinDate: new Date(Date.now() - 200 * 86400000),
    },
    update: { userId: workerUser.id },
  });
  const demoWorker = await prisma.worker.upsert({
    where: { employeeId: workerEmployee.id },
    create: { employeeId: workerEmployee.id, skills: { create: [{ skillId: skills["Harvesting"].id }, { skillId: skills["Irrigation"].id }] } },
    update: {},
  });

  // ~17 more field workers without login (attendance/assignment is handled by their supervisor).
  const workerNames = [
    "Baiju P.", "Chandran K.", "Devi S.", "Elias Thomas", "Faisal Rahman", "Girija Devi", "Hari Das",
    "Indira Bai", "Joseph Mathew", "Kunjumon", "Latha Kumari", "Mohanan Nair", "Nisha Rani",
    "Omana Kutty", "Pradeep Kumar", "Rajan Pillai", "Saleena Beevi",
  ];
  const fieldWorkers = [demoWorker];
  let empSeq = 101;
  for (const name of workerNames) {
    const code = `EMP-${empSeq++}`;
    const emp = await prisma.employee.upsert({
      where: { employeeCode: code },
      create: {
        farmId: farm.id,
        employeeCode: code,
        name,
        employmentCategory: "DAILY_WAGE",
        departmentId: departments["Field Labour"].id,
        designationId: designations["Field Worker"].id,
        joinDate: new Date(Date.now() - 300 * 86400000),
      },
      update: {},
    });
    const skillPool = Object.values(skills);
    const worker = await prisma.worker.upsert({
      where: { employeeId: emp.id },
      create: {
        employeeId: emp.id,
        skills: { create: [{ skillId: skillPool[Math.floor(Math.random() * skillPool.length)].id }] },
      },
      update: {},
    });
    fieldWorkers.push(worker);
  }

  console.log("Seeding attendance for today…");
  const today = dateOnly();
  for (const [idx, worker] of fieldWorkers.entries()) {
    const status = idx === 3 ? "ABSENT" : idx === 5 ? "HALF_DAY" : "PRESENT";
    await prisma.attendance.upsert({
      where: { workerId_date: { workerId: worker.id, date: today } },
      create: {
        farmId: farm.id,
        workerId: worker.id,
        date: today,
        method: "MANUAL",
        status,
        checkInAt: status === "ABSENT" ? undefined : new Date(today.getTime() + 8 * 3600000),
        checkOutAt: status === "PRESENT" ? new Date(today.getTime() + 17 * 3600000) : undefined,
        createdById: coordinator.id,
        updatedById: coordinator.id,
      },
      update: {},
    });
  }

  console.log("Seeding tasks…");
  async function makeTask(input: {
    farmAreaId: string;
    plotId?: string;
    subPlotId?: string;
    cropCycleId?: string;
    category: string;
    description: string;
    priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
    status: string;
    supervisorUserId: string;
    daysFromToday?: number;
    requestedWorkers?: number;
    requiresEvidence?: boolean;
  }) {
    const date = dateOnly(input.daysFromToday ?? 0);
    return prisma.task.create({
      data: {
        farmId: farm.id,
        taskNumber: `T-${date.toISOString().slice(0, 10).replace(/-/g, "")}-${Math.random().toString(16).slice(2, 6).toUpperCase()}`,
        date,
        farmAreaId: input.farmAreaId,
        plotId: input.plotId,
        subPlotId: input.subPlotId,
        cropCycleId: input.cropCycleId,
        category: input.category,
        description: input.description,
        priority: input.priority,
        requestedWorkers: input.requestedWorkers ?? 2,
        status: input.status as any,
        assignedSupervisorId: input.supervisorUserId,
        requiresEvidence: input.requiresEvidence ?? false,
        plannedStart: new Date(date.getTime() + 8 * 3600000),
        plannedEnd: new Date(date.getTime() + 13 * 3600000),
        approvedById: ["APPROVED", "ASSIGNED", "IN_PROGRESS", "PAUSED", "BLOCKED", "COMPLETED", "VERIFIED"].includes(input.status)
          ? farmManager.id
          : undefined,
        approvedAt: ["APPROVED", "ASSIGNED", "IN_PROGRESS", "PAUSED", "BLOCKED", "COMPLETED", "VERIFIED"].includes(input.status)
          ? new Date()
          : undefined,
        createdById: coordinator.id,
        updatedById: coordinator.id,
      },
    });
  }

  const taskDraftTomorrow = await makeTask({
    farmAreaId: farmAreas["PLOT-C"].id,
    plotId: plotC.id,
    category: "Land preparation",
    description: "Plough and level Plot C Block 1 ahead of the next turmeric cycle",
    priority: "MEDIUM",
    status: "SUBMITTED",
    supervisorUserId: supervisorC.id,
    daysFromToday: 1,
  });

  const taskCritical = await makeTask({
    farmAreaId: farmAreas["DAIRY"].id,
    category: "Equipment repair",
    description: "Milking machine vacuum pump failure — needs urgent repair before evening session",
    priority: "CRITICAL",
    status: "SUBMITTED",
    supervisorUserId: dairyAssistant.id,
    requestedWorkers: 1,
  });

  const taskAssigned = await makeTask({
    farmAreaId: farmAreas["PLOT-A"].id,
    plotId: plotA.id,
    cropCycleId: riceCycle.id,
    category: "Weeding",
    description: "Manual weeding — Plot A Block 1 (rice, vegetative stage)",
    priority: "HIGH",
    status: "ASSIGNED",
    supervisorUserId: supervisorA.id,
    requestedWorkers: 3,
  });
  await prisma.taskAssignment.create({ data: { taskId: taskAssigned.id, workerId: fieldWorkers[1].id, assignedById: coordinator.id } });
  await prisma.taskAssignment.create({ data: { taskId: taskAssigned.id, workerId: fieldWorkers[2].id, assignedById: coordinator.id } });

  const taskInProgress = await makeTask({
    farmAreaId: farmAreas["PLOT-B"].id,
    plotId: plotB.id,
    subPlotId: subPlots[0].id,
    cropCycleId: gingerCycle.id,
    category: "Irrigation",
    description: "Drip irrigation check and manual top-up — Sub-plot B1 (ginger nursery)",
    priority: "MEDIUM",
    status: "IN_PROGRESS",
    supervisorUserId: supervisorB.id,
    requestedWorkers: 1,
  });
  await prisma.taskAssignment.create({ data: { taskId: taskInProgress.id, workerId: demoWorker.id, assignedById: coordinator.id, roleOnTask: "Lead" } });
  await prisma.taskProgress.create({
    data: { taskId: taskInProgress.id, recordedById: workerUser.id, statusFrom: "ASSIGNED", statusTo: "IN_PROGRESS", notes: "Started irrigation check" },
  });

  const taskCompleted = await makeTask({
    farmAreaId: farmAreas["KITCHEN-GARDEN"].id,
    category: "Harvesting",
    description: "Harvest ready vegetables from the kitchen garden for the farmhouse kitchen",
    priority: "LOW",
    status: "COMPLETED",
    supervisorUserId: gardenSupervisor.id,
    requestedWorkers: 1,
  });
  await prisma.taskAssignment.create({ data: { taskId: taskCompleted.id, workerId: fieldWorkers[4].id, assignedById: coordinator.id, isActive: false, unassignedAt: new Date() } });
  await prisma.taskProgress.create({
    data: { taskId: taskCompleted.id, recordedById: gardenSupervisor.id, statusFrom: "IN_PROGRESS", statusTo: "COMPLETED", quantityCompleted: 18, unit: "kg" },
  });

  const taskBlocked = await makeTask({
    farmAreaId: farmAreas["PLOT-C"].id,
    plotId: plotC.id,
    category: "Spraying",
    description: "Neem oil spraying delayed — sprayer pump under repair",
    priority: "HIGH",
    status: "BLOCKED",
    supervisorUserId: supervisorC.id,
  });
  await prisma.taskProgress.create({
    data: { taskId: taskBlocked.id, recordedById: supervisorC.id, statusFrom: "IN_PROGRESS", statusTo: "BLOCKED", notes: "Sprayer pump not working, machinery module ticket raised" },
  });

  const taskToCarryForward = await makeTask({
    farmAreaId: farmAreas["PLOT-A"].id,
    plotId: plotA.id,
    category: "Manuring",
    description: "Apply Jeevamritham to Plot A Block 1",
    priority: "MEDIUM",
    status: "PAUSED",
    supervisorUserId: supervisorA.id,
    daysFromToday: -1,
  });

  await makeTask({
    farmAreaId: farmAreas["HERBAL-GARDEN"].id,
    category: "Pruning",
    description: "Seasonal pruning — Herbal Garden",
    priority: "LOW",
    status: "CANCELLED",
    supervisorUserId: gardenSupervisor.id,
  });

  const taskVerified = await makeTask({
    farmAreaId: farmAreas["PLOT-B"].id,
    plotId: plotB.id,
    category: "Harvesting",
    description: "Harvest count — earlier ginger block",
    priority: "MEDIUM",
    status: "VERIFIED",
    supervisorUserId: supervisorB.id,
    daysFromToday: -2,
  });
  void taskVerified;
  void taskDraftTomorrow;

  console.log("Seeding a pending reassignment request…");
  const targetTask = await makeTask({
    farmAreaId: farmAreas["DAIRY"].id,
    category: "Equipment repair",
    description: "Assist with milking machine emergency repair",
    priority: "CRITICAL",
    status: "ASSIGNED",
    supervisorUserId: dairyAssistant.id,
    requestedWorkers: 1,
  });
  await prisma.reassignmentRequest.create({
    data: {
      farmId: farm.id,
      workerId: fieldWorkers[1].id,
      fromTaskId: taskAssigned.id,
      toTaskId: targetTask.id,
      reason: "Dairy emergency repair needs an extra hand right now — pulling from Plot A weeding",
      urgency: "URGENT",
      requestedById: coordinator.id,
    },
  });

  console.log("Seeding a pending labour request…");
  await prisma.labourRequest.create({
    data: {
      farmId: farm.id,
      taskId: taskDraftTomorrow.id,
      requestedById: supervisorC.id,
      requestedCount: 4,
      skillsNeeded: ["Ploughing"],
      urgency: "NORMAL",
      notes: "Need 4 workers for land preparation tomorrow morning",
    },
  });

  console.log("Seeding machinery…");
  const tractor = await prisma.asset.upsert({
    where: { assetCode: "TR-01" },
    create: {
      farmId: farm.id,
      assetCode: "TR-01",
      name: "Mahindra 275 DI Tractor",
      type: "TRACTOR",
      purchaseDate: new Date("2022-04-01"),
      purchaseCost: 650000,
      serviceIntervalHours: 250,
      meterHours: 240,
      operationalStatus: "AVAILABLE",
      createdById: officer.id,
      updatedById: officer.id,
    },
    update: {},
  });
  await prisma.asset.upsert({
    where: { assetCode: "SPR-01" },
    create: {
      farmId: farm.id,
      assetCode: "SPR-01",
      name: "Backpack Sprayer #1",
      type: "SPRAYER",
      purchaseDate: new Date("2023-06-01"),
      purchaseCost: 4500,
      serviceIntervalHours: 100,
      meterHours: 30,
      operationalStatus: "UNDER_REPAIR",
      createdById: officer.id,
      updatedById: officer.id,
    },
    update: {},
  });
  await prisma.asset.upsert({
    where: { assetCode: "PUMP-01" },
    create: {
      farmId: farm.id,
      assetCode: "PUMP-01",
      name: "Irrigation Pump Set",
      type: "PUMP",
      purchaseDate: new Date("2021-01-15"),
      purchaseCost: 22000,
      operationalStatus: "IN_USE",
      createdById: officer.id,
      updatedById: officer.id,
    },
    update: {},
  });
  await prisma.machineryUsage.create({
    data: { assetId: tractor.id, operatorId: fieldWorkers[2].id, hoursUsed: 4, notes: "Land preparation, Plot C" },
  });
  const sprayerAsset = await prisma.asset.findUniqueOrThrow({ where: { assetCode: "SPR-01" } });
  await prisma.maintenanceRequest.create({
    data: {
      assetId: sprayerAsset.id,
      reportedById: supervisorC.id,
      issueDescription: "Pump not building pressure, nozzle possibly clogged",
      priority: "HIGH",
      status: "open",
    },
  });

  console.log("Seeding inventory & procurement…");
  const generalStore = await prisma.stockLocation.create({ data: { farmAreaId: farmAreas["GENERAL-STORE"].id, name: "General Store", type: "store" } });
  const seedStoreLocation = await prisma.stockLocation.create({ data: { farmAreaId: farmAreas["SEED-STORE"].id, name: "Seed Store", type: "store" } });
  void seedStoreLocation;

  const ureaItem = await prisma.inventoryItem.create({
    data: { farmId: farm.id, name: "Urea Fertilizer", category: "MANURE", unit: "kg", minStockLevel: 50 },
  });
  const neemOilItem = await prisma.inventoryItem.create({
    data: { farmId: farm.id, name: "Neem Oil (raw)", category: "ORGANIC_INPUTS", unit: "litre", minStockLevel: 10 },
  });
  const packagingItem = await prisma.inventoryItem.create({
    data: { farmId: farm.id, name: "Packaging Boxes (5kg)", category: "PACKAGING", unit: "pcs", minStockLevel: 100 },
  });

  const ureaBatch = await prisma.inventoryBatch.create({
    data: { itemId: ureaItem.id, batchNumber: "UREA-2026-01", quantity: 40, unit: "kg", storageLocationId: generalStore.id, receivedDate: new Date() },
  });
  await prisma.stockMovement.create({
    data: { farmId: farm.id, itemId: ureaItem.id, batchId: ureaBatch.id, toLocationId: generalStore.id, quantity: 40, unit: "kg", movementType: "PURCHASE_RECEIPT", receivedById: officer.id },
  });
  const neemBatch = await prisma.inventoryBatch.create({
    data: { itemId: neemOilItem.id, batchNumber: "NEEM-2026-01", quantity: 25, unit: "litre", storageLocationId: generalStore.id, receivedDate: new Date() },
  });
  await prisma.stockMovement.create({
    data: { farmId: farm.id, itemId: neemOilItem.id, batchId: neemBatch.id, toLocationId: generalStore.id, quantity: 25, unit: "litre", movementType: "PURCHASE_RECEIPT", receivedById: officer.id },
  });
  await prisma.inventoryBatch.create({
    data: { itemId: packagingItem.id, quantity: 60, unit: "pcs", storageLocationId: generalStore.id, receivedDate: new Date() },
  });

  const vendor = await prisma.vendor.create({ data: { farmId: farm.id, name: "Thrissur Agro Traders", category: "Fertilizer & Inputs", phone: "9847012345" } });
  const pendingRequisition = await prisma.purchaseRequisition.create({
    data: {
      farmId: farm.id,
      requestedById: supervisorA.id,
      neededBy: new Date(Date.now() + 5 * 86400000),
      status: "submitted",
      lines: { create: [{ itemId: ureaItem.id, quantity: 100, unit: "kg" }] },
    },
  });
  void pendingRequisition;

  console.log("Seeding nursery & seed data…");
  const riceLot = await prisma.seedLot.create({
    data: {
      farmId: farm.id,
      lotNumber: `SL-NAT-${Date.now().toString(36).toUpperCase()}`,
      cropId: rice.id,
      varietyId: riceVarieties[1].id,
      classification: "NATIVE",
      source: "Farm-saved seed",
      procurementDate: new Date(Date.now() - 20 * 86400000),
      quantity: 15,
      unit: "kg",
      storageLocationId: seedStoreLocation.id,
      container: "Sealed tin",
      storageTemperature: 22,
      storageHumidity: 45,
      currentBalance: 12,
      createdById: researchOfficer.id,
      updatedById: researchOfficer.id,
    },
  });
  const gingerLot = await prisma.seedLot.create({
    data: {
      farmId: farm.id,
      lotNumber: `SL-COM-${Date.now().toString(36).toUpperCase()}1`,
      cropId: ginger.id,
      varietyId: gingerVariety.id,
      classification: "COMMERCIAL",
      source: "Purchased — Thrissur Agro Traders",
      quantity: 50,
      unit: "kg",
      storageLocationId: seedStoreLocation.id,
      currentBalance: 50,
      expiryDate: new Date(Date.now() + 10 * 86400000),
      createdById: researchOfficer.id,
      updatedById: researchOfficer.id,
    },
  });
  await prisma.germinationTrial.create({
    data: {
      seedLotId: riceLot.id,
      seedsTested: 100,
      seedsGerminated: 42,
      growingMedium: "Coco peat tray",
      staffId: researchOfficer.id,
      observations: "Below-average germination, possible storage humidity issue",
      approvedForSowing: false,
      correctiveAction: "Re-test with fresh tray; review storage humidity logs",
    },
  });
  await prisma.nurseryBatch.create({
    data: {
      farmId: farm.id,
      seedLotId: riceLot.id,
      cropId: rice.id,
      varietyId: riceVarieties[1].id,
      stage: "SEED_TRAY",
      quantity: 200,
      currentLocation: "Nursery Tray Row 1",
      createdById: researchOfficer.id,
      updatedById: researchOfficer.id,
    },
  });
  void gingerLot;

  console.log("Seeding soil health & organic inputs…");
  await prisma.soilTest.create({
    data: {
      farmId: farm.id,
      plotId: plotA.id,
      sampleLocation: "Block A-1, NE corner",
      nitrogen: 280,
      phosphorus: 22,
      potassium: 180,
      ph: 6.4,
      moisture: 32,
      testMethod: "Soil test kit",
      testedById: researchOfficer.id,
      observations: "Healthy range, slightly low phosphorus",
      recommendation: "Apply rock phosphate before next cycle",
    },
  });
  await prisma.plantHealthRecord.create({
    data: {
      farmId: farm.id,
      cropCycleId: riceCycle.id,
      growthStage: "Vegetative",
      symptoms: "Yellowing leaf tips on a few plants near the bund",
      severity: "MINOR",
      suspectedCause: "Possible nitrogen deficiency",
      recommendedTreatment: "Foliar spray of Panchagavya",
      recordedById: researchOfficer.id,
    },
  });

  const jeevamrithamRecipe = await prisma.organicInputRecipe.create({
    data: { name: "Jeevamritham", category: "Jeevamritham", standardYield: 200, unit: "litre" },
  });
  const jeevamrithamBatch = await prisma.organicInputBatch.create({
    data: {
      farmId: farm.id,
      recipeId: jeevamrithamRecipe.id,
      batchNumber: `OIB-${Date.now().toString(36).toUpperCase()}`,
      preparationDate: new Date(Date.now() - 7 * 86400000),
      preparedById: researchOfficer.id,
      fermentationPeriodDays: 7,
      availableQuantity: 150,
      unit: "litre",
      storageLocationId: generalStore.id,
    },
  });
  await prisma.inputApplication.create({
    data: {
      farmId: farm.id,
      batchId: jeevamrithamBatch.id,
      targetType: "plot",
      targetId: plotA.id,
      quantity: 40,
      unit: "litre",
      dilutionRatio: "1:10",
      method: "Drip irrigation",
      appliedById: researchOfficer.id,
      purpose: "Routine soil fertility boost",
    },
  });
  await prisma.organicInputBatch.update({ where: { id: jeevamrithamBatch.id }, data: { availableQuantity: 110 } });

  console.log("Seeding harvest & distribution…");
  await prisma.harvestForecast.create({
    data: {
      farmId: farm.id,
      cropCycleId: gingerCycle.id,
      expectedDate: new Date(Date.now() + 45 * 86400000),
      expectedGrade: "A",
      expectedQuantity: 380,
      unit: "kg",
      createdById: researchOfficer.id,
    },
  });
  const localClient = await prisma.recipient.create({ data: { farmId: farm.id, name: "Kochi Organic Market", type: "CLIENT", contactInfo: "9847099887" } });
  void localClient;

  console.log("Seeding dairy & livestock…");
  const cow1 = await prisma.animal.create({
    data: { farmId: farm.id, animalTag: "COW-01", name: "Lakshmi", species: "COW", breed: "Gir", sex: "F", birthDate: new Date("2021-03-10"), status: "active", createdById: dairyAssistant.id, updatedById: dairyAssistant.id },
  });
  const cow2 = await prisma.animal.create({
    data: { farmId: farm.id, animalTag: "COW-02", name: "Ganga", species: "COW", breed: "Sahiwal", sex: "F", birthDate: new Date("2020-07-22"), status: "active", createdById: dairyAssistant.id, updatedById: dairyAssistant.id },
  });
  const morningCollection = await prisma.milkCollection.create({
    data: { farmId: farm.id, animalId: cow1.id, date: today, session: "MORNING", quantityLitres: 8.5, collectedById: dairyAssistant.id },
  });
  await prisma.milkQualityTest.create({
    data: { milkCollectionId: morningCollection.id, fat: 4.2, protein: 3.3, lactose: 4.7, testedById: dairyAssistant.id, testedAt: new Date() },
  });
  const cow2Collection = await prisma.milkCollection.create({
    data: { farmId: farm.id, animalId: cow2.id, date: today, session: "MORNING", quantityLitres: 6.2, collectedById: dairyAssistant.id },
  });
  await prisma.milkQualityTest.create({
    data: { milkCollectionId: cow2Collection.id, fat: 2.6, testedById: dairyAssistant.id, testedAt: new Date(), abnormality: "Fat content below normal range" },
  });
  await prisma.animalHealthRecord.create({
    data: { animalId: cow1.id, type: "Vaccination", description: "FMD vaccine booster", performedById: dairyAssistant.id, nextDueDate: new Date(Date.now() + 180 * 86400000) },
  });

  console.log("Seeding inspections, R&D & expenses…");
  await prisma.issue.create({
    data: {
      farmId: farm.id,
      farmAreaId: farmAreas["KITCHEN-GARDEN"].id,
      category: "Fencing",
      severity: "OBSERVATION",
      description: "Loose fence post near the kitchen garden gate",
      reportedById: inspector.id,
      status: "OPEN",
    },
  });
  const criticalIssue = await prisma.issue.create({
    data: {
      farmId: farm.id,
      farmAreaId: farmAreas["DAIRY"].id,
      category: "Safety",
      severity: "CRITICAL",
      description: "Exposed wiring near the milking parlour",
      reportedById: inspector.id,
      status: "ESCALATED",
      escalatedAt: new Date(),
      escalatedToId: farmManager.id,
    },
  });
  void criticalIssue;

  const riceTrial = await prisma.rAndDTrial.create({
    data: {
      farmId: farm.id,
      trialCode: `TRIAL-${Date.now().toString(36).toUpperCase()}`,
      objective: "Compare yield of 6 native rice varieties under organic-only inputs",
      cropId: rice.id,
      varietyId: riceVarieties[0].id,
      hypothesis: "Native varieties will show comparable yield with lower input cost than the experimental hybrid",
      cultivationBlockId: blockA1.id,
      startDate: new Date(Date.now() - 60 * 86400000),
      methodology: "Randomized block design across Plot A sub-sections",
      status: "active",
      createdById: researchOfficer.id,
      updatedById: researchOfficer.id,
    },
  });
  await prisma.trialObservation.create({
    data: { trialId: riceTrial.id, notes: "Healthy tillering, no pest pressure observed at day 45", observedById: researchOfficer.id },
  });

  const fuelExpense = await prisma.expense.create({
    data: {
      farmId: farm.id,
      expenseNumber: `EXP-${Date.now().toString(36).toUpperCase()}`,
      category: "Fuel",
      department: "Machinery",
      amount: 3200,
      submittedById: officer.id,
      financeStatus: "PENDING",
    },
  });
  void fuelExpense;
  await prisma.pettyCashTransaction.create({
    data: { farmId: farm.id, type: "opening", amount: 25000, balanceAfter: 25000, recordedById: officer.id },
  });

  console.log("Seeding crop calendar…");
  const riceCalendar = await prisma.cropCalendar.create({
    data: {
      cropId: rice.id,
      varietyId: riceVarieties[0].id,
      season: "Kharif",
      sowingWindowStart: "06-01",
      sowingWindowEnd: "07-15",
      transplantingWindowStart: "07-01",
      transplantingWindowEnd: "07-20",
      irrigationSchedule: "Maintain 2-3cm standing water through vegetative stage",
      manuringSchedule: "Jeevamritham every 15 days",
      expectedYieldPerUnitArea: 350,
      createdById: researchOfficer.id,
      updatedById: researchOfficer.id,
    },
  });
  await prisma.cropActivity.createMany({
    data: [
      { cropCalendarId: riceCalendar.id, stageName: "Land preparation", dayOffset: -7, activityName: "Plough and level field" },
      { cropCalendarId: riceCalendar.id, stageName: "Sowing", dayOffset: 0, activityName: "Sow pre-germinated seed" },
      { cropCalendarId: riceCalendar.id, stageName: "Vegetative", dayOffset: 15, activityName: "Apply Jeevamritham" },
      { cropCalendarId: riceCalendar.id, stageName: "Vegetative", dayOffset: 30, activityName: "Weeding" },
      { cropCalendarId: riceCalendar.id, stageName: "Flowering", dayOffset: 60, activityName: "Panchagavya foliar spray" },
    ],
  });
  await prisma.cropCycle.update({ where: { id: riceCycle.id }, data: { cropCalendarId: riceCalendar.id } });

  console.log("Seeding a few audit log entries…");
  await prisma.auditLog.createMany({
    data: [
      { entityType: "Task", entityId: taskAssigned.id, action: "CREATE", userId: coordinator.id, farmId: farm.id },
      { entityType: "Task", entityId: taskAssigned.id, action: "APPROVE", userId: farmManager.id, farmId: farm.id },
      { entityType: "User", entityId: superAdmin.id, action: "CREATE", userId: superAdmin.id, farmId: farm.id },
    ],
  });

  console.log("Seeding recruitment, learning, onboarding & offboarding demo data…");
  const fieldWorkerRequisition = await prisma.jobRequisition.create({
    data: {
      farmId: farm.id,
      title: "Field Worker — Harvest Season",
      departmentId: departments["Field Labour"].id,
      designationId: designations["Field Worker"].id,
      openings: 3,
      status: "OPEN",
      description: "Additional seasonal field workers needed for the upcoming harvest.",
      targetJoinDate: new Date(Date.now() + 30 * 86400000),
      createdById: officer.id,
      updatedById: officer.id,
    },
  });
  await prisma.jobApplication.createMany({
    data: [
      { requisitionId: fieldWorkerRequisition.id, candidateName: "Ajayan Pillai", phone: "9847011111", stage: "APPLIED", createdById: officer.id, updatedById: officer.id },
      { requisitionId: fieldWorkerRequisition.id, candidateName: "Beena Thankachan", phone: "9847022222", stage: "INTERVIEW", createdById: officer.id, updatedById: officer.id },
      { requisitionId: fieldWorkerRequisition.id, candidateName: "Chandrika Amma", phone: "9847033333", stage: "SCREENING", createdById: officer.id, updatedById: officer.id },
    ],
  });
  await prisma.jobRequisition.create({
    data: {
      farmId: farm.id,
      title: "Dairy Assistant",
      departmentId: departments["Dairy"].id,
      designationId: designations["Dairy / R&D Assistant"].id,
      openings: 1,
      status: "CLOSED",
      description: "Backfill for the dairy shed — closed, position filled internally.",
      createdById: officer.id,
      updatedById: officer.id,
    },
  });

  const orgCertProgram = await prisma.trainingProgram.create({
    data: {
      farmId: farm.id,
      title: "Organic Certification Refresher",
      category: "Compliance",
      description: "Annual refresher on organic certification standards and record-keeping.",
      createdById: researchOfficer.id,
      updatedById: researchOfficer.id,
    },
  });
  const orgCertSession = await prisma.trainingSession.create({
    data: {
      programId: orgCertProgram.id,
      trainer: "Dr. Lakshmi Pillai",
      location: "Farm office training hall",
      scheduledDate: new Date(Date.now() + 10 * 86400000),
      status: "SCHEDULED",
      createdById: researchOfficer.id,
    },
  });
  await prisma.trainingEnrollment.createMany({
    data: [
      { sessionId: orgCertSession.id, employeeId: staffEmployees["EMP-005"].id, status: "ENROLLED" },
      { sessionId: orgCertSession.id, employeeId: staffEmployees["EMP-009"].id, status: "ENROLLED" },
    ],
  });
  const safetyProgram = await prisma.trainingProgram.create({
    data: {
      farmId: farm.id,
      title: "Machinery Safety Induction",
      category: "Safety",
      description: "Safe operating procedures for tractors, cutters and pumps.",
      createdById: officer.id,
      updatedById: officer.id,
    },
  });
  const safetySession = await prisma.trainingSession.create({
    data: {
      programId: safetyProgram.id,
      trainer: "Biju Thomas",
      location: "Machinery shed",
      scheduledDate: new Date(Date.now() - 20 * 86400000),
      status: "COMPLETED",
      createdById: officer.id,
    },
  });
  await prisma.trainingEnrollment.create({
    data: {
      sessionId: safetySession.id,
      employeeId: workerEmployee.id,
      status: "COMPLETED",
      score: 88,
      feedback: "Confident on tractor pre-checks; needs a refresher on PTO safety.",
    },
  });

  await prisma.onboardingCase.create({
    data: {
      employeeId: workerEmployee.id,
      startDate: workerEmployee.joinDate ?? new Date(),
      status: "IN_PROGRESS",
      createdById: officer.id,
      tasks: {
        create: [
          { title: "Collect HR paperwork and identity documents", status: "DONE", completedAt: new Date() },
          { title: "Issue equipment / uniform / access", status: "DONE", completedAt: new Date() },
          { title: "Site induction and safety briefing", status: "PENDING" },
          { title: "Assign supervisor and first task", status: "PENDING" },
        ],
      },
    },
  });

  await prisma.offboardingCase.create({
    data: {
      employeeId: staffEmployees["EMP-010"].id,
      reason: "CONTRACT_END",
      lastWorkingDay: new Date(Date.now() + 15 * 86400000),
      notes: "Fixed-term contract concludes at season end; handover to be completed before departure.",
      status: "IN_PROGRESS",
      createdById: officer.id,
      tasks: {
        create: [
          { title: "Return company property / equipment", status: "PENDING" },
          { title: "Knowledge transfer and handover", status: "IN_PROGRESS" },
          { title: "Clear pending dues / final settlement", status: "PENDING" },
          { title: "Revoke system access", status: "PENDING" },
        ],
      },
    },
  });

  console.log("\nSeed complete. Demo users (password for all: Demo@1234):");
  for (const email of [
    "admin@athachifarms.demo (Super Admin)",
    "management@athachifarms.demo (Top Management)",
    "farmmanager@athachifarms.demo (Farm Manager)",
    "coordinator@athachifarms.demo (Chief Coordinator)",
    "officer@athachifarms.demo (Farm Officer)",
    "research@athachifarms.demo (Senior Research Officer)",
    "supervisor.a@athachifarms.demo (Plot A Supervisor)",
    "supervisor.b@athachifarms.demo (Plot B Supervisor)",
    "supervisor.c@athachifarms.demo (Plot C Supervisor)",
    "garden@athachifarms.demo (Garden Supervisor)",
    "inspector@athachifarms.demo (Field Inspector)",
    "distribution@athachifarms.demo (Distribution In-Charge)",
    "dairy@athachifarms.demo (Dairy/R&D Assistant)",
    "worker@athachifarms.demo (Worker)",
    "auditor@athachifarms.demo (Auditor)",
  ]) {
    console.log(`  - ${email}`);
  }
  void topManagement;
  void auditor;
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
