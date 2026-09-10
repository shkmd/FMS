import { z } from "zod";
import { TaskPriority, RequestUrgency, FarmAreaType, AttendanceMethod, AttendanceStatus } from "./enums";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const requestPasswordResetSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(10),
  newPassword: z.string().min(8),
});

export const createTaskSchema = z.object({
  date: z.string(), // ISO date
  farmAreaId: z.string().uuid(),
  plotId: z.string().uuid().optional().nullable(),
  subPlotId: z.string().uuid().optional().nullable(),
  cropCycleId: z.string().uuid().optional().nullable(),
  category: z.string().min(1),
  description: z.string().optional(),
  priority: z.enum(TaskPriority).default("MEDIUM"),
  requestedWorkers: z.number().int().min(1).default(1),
  requiredSkills: z.array(z.string()).default([]),
  plannedStart: z.string().optional().nullable(),
  plannedEnd: z.string().optional().nullable(),
  expectedOutput: z.string().optional(),
  requiredInputsNotes: z.string().optional(),
  assignedSupervisorId: z.string().uuid().optional().nullable(),
  safetyNotes: z.string().optional(),
  requiresEvidence: z.boolean().default(false),
  dependsOnTaskIds: z.array(z.string().uuid()).default([]),
});
export type CreateTaskInput = z.infer<typeof createTaskSchema>;

export const updateTaskSchema = createTaskSchema.partial();
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;

export const assignWorkerSchema = z.object({
  workerId: z.string().uuid(),
  roleOnTask: z.string().optional(),
  hoursPlanned: z.number().positive().optional(),
});
export type AssignWorkerInput = z.infer<typeof assignWorkerSchema>;

export const recordProgressSchema = z.object({
  statusTo: z.string(),
  quantityCompleted: z.number().optional(),
  unit: z.string().optional(),
  notes: z.string().optional(),
  gpsLat: z.number().optional(),
  gpsLng: z.number().optional(),
});
export type RecordProgressInput = z.infer<typeof recordProgressSchema>;

export const carryForwardSchema = z.object({
  reason: z.string().min(3),
});

export const createReassignmentRequestSchema = z.object({
  workerId: z.string().uuid(),
  fromTaskId: z.string().uuid(),
  toTaskId: z.string().uuid(),
  reason: z.string().min(3),
  urgency: z.enum(RequestUrgency).default("NORMAL"),
  replacementWorkerId: z.string().uuid().optional().nullable(),
});
export type CreateReassignmentRequestInput = z.infer<typeof createReassignmentRequestSchema>;

export const decideReassignmentRequestSchema = z.object({
  approve: z.boolean(),
  notes: z.string().optional(),
});
export type DecideReassignmentRequestInput = z.infer<typeof decideReassignmentRequestSchema>;

export const markAttendanceSchema = z.object({
  workerId: z.string().uuid(),
  date: z.string(),
  method: z.enum(AttendanceMethod).default("MANUAL"),
  status: z.enum(AttendanceStatus).default("PRESENT"),
  checkInAt: z.string().optional(),
  checkOutAt: z.string().optional(),
  farmAreaId: z.string().uuid().optional(),
  photoMediaId: z.string().optional(),
});
export type MarkAttendanceInput = z.infer<typeof markAttendanceSchema>;

export const createFarmAreaSchema = z.object({
  farmId: z.string().uuid(),
  name: z.string().min(1),
  code: z.string().min(1),
  type: z.enum(FarmAreaType),
  areaSize: z.number().optional(),
  areaUnit: z.string().default("acre"),
  soilType: z.string().optional(),
  irrigationMethod: z.string().optional(),
  supervisorId: z.string().uuid().optional(),
  boundary: z.any().optional(),
  centerLat: z.number().optional(),
  centerLng: z.number().optional(),
  description: z.string().optional(),
});
export type CreateFarmAreaInput = z.infer<typeof createFarmAreaSchema>;

export const createPlotSchema = z.object({
  farmId: z.string().uuid(),
  farmAreaId: z.string().uuid().optional(),
  code: z.string().min(1),
  name: z.string().min(1),
  totalArea: z.number().optional(),
  soilType: z.string().optional(),
  irrigationMethod: z.string().optional(),
  supervisorId: z.string().uuid().optional(),
  boundary: z.any().optional(),
  centerLat: z.number().optional(),
  centerLng: z.number().optional(),
});
export type CreatePlotInput = z.infer<typeof createPlotSchema>;

export const createSubPlotSchema = z.object({
  plotId: z.string().uuid(),
  code: z.string().min(1),
  name: z.string().min(1),
  area: z.number().optional(),
  boundary: z.any().optional(),
});
export type CreateSubPlotInput = z.infer<typeof createSubPlotSchema>;

export const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  phone: z.string().optional(),
  password: z.string().min(8),
  roleCodes: z.array(z.string()).min(1),
  farmAreaIds: z.array(z.string().uuid()).default([]),
});
export type CreateUserInput = z.infer<typeof createUserSchema>;
