"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./api-client";

// ---- Farm structure ----
export const useFarms = () => useQuery({ queryKey: ["farms"], queryFn: () => api.get<any[]>("/farms") });
export const useFarmAreas = (farmId?: string) =>
  useQuery({
    queryKey: ["farm-areas", farmId],
    queryFn: () => api.get<any[]>(`/farm-areas${farmId ? `?farmId=${farmId}` : ""}`),
  });
export const usePlots = (farmId?: string) =>
  useQuery({ queryKey: ["plots", farmId], queryFn: () => api.get<any[]>(`/plots${farmId ? `?farmId=${farmId}` : ""}`) });
export const usePlot = (id?: string) =>
  useQuery({ queryKey: ["plot", id], queryFn: () => api.get<any>(`/plots/${id}`), enabled: !!id });
export const useFarmMap = (farmId?: string) =>
  useQuery({ queryKey: ["farm-map", farmId], queryFn: () => api.get<any>(`/farm-map?farmId=${farmId}`), enabled: !!farmId });
export const useCultivationBlocks = (plotId?: string) =>
  useQuery({
    queryKey: ["cultivation-blocks", plotId],
    queryFn: () => api.get<any[]>(`/cultivation-blocks${plotId ? `?plotId=${plotId}` : ""}`),
    enabled: !!plotId,
  });

// ---- Crops ----
export const useCrops = () => useQuery({ queryKey: ["crops"], queryFn: () => api.get<any[]>("/crops") });
export const useCropCycles = (cultivationBlockId?: string) =>
  useQuery({
    queryKey: ["crop-cycles", cultivationBlockId],
    queryFn: () => api.get<any[]>(`/crop-cycles${cultivationBlockId ? `?cultivationBlockId=${cultivationBlockId}` : ""}`),
  });

// ---- Workforce ----
export const useEmployees = () => useQuery({ queryKey: ["employees"], queryFn: () => api.get<any[]>("/employees") });
export const useEmployee = (id?: string) =>
  useQuery({ queryKey: ["employee", id], queryFn: () => api.get<any>(`/employees/${id}`), enabled: !!id });
export const useWorkers = () => useQuery({ queryKey: ["workers"], queryFn: () => api.get<any[]>("/workers") });
export const useAvailableWorkers = (farmId?: string) =>
  useQuery({
    queryKey: ["workers-available", farmId],
    queryFn: () => api.get<any[]>(`/workers/available?farmId=${farmId}`),
    enabled: !!farmId,
  });
export const useSkills = () => useQuery({ queryKey: ["skills"], queryFn: () => api.get<any[]>("/skills") });

export function useEmployeeMutations() {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["employees"] });
    qc.invalidateQueries({ queryKey: ["employee"] });
    qc.invalidateQueries({ queryKey: ["workers"] });
    qc.invalidateQueries({ queryKey: ["workers-available"] });
  };
  const createEmployee = useMutation({ mutationFn: (data: any) => api.post("/employees", data), onSuccess: invalidate });
  const updateEmployee = useMutation({ mutationFn: ({ id, ...data }: any) => api.patch(`/employees/${id}`, data), onSuccess: invalidate });
  const deleteEmployee = useMutation({ mutationFn: (id: string) => api.delete(`/employees/${id}`), onSuccess: invalidate });
  const createSkill = useMutation({ mutationFn: (data: any) => api.post("/skills", data), onSuccess: () => qc.invalidateQueries({ queryKey: ["skills"] }) });
  return { createEmployee, updateEmployee, deleteEmployee, createSkill };
}

// ---- Workforce HR: departments, designations, recruitment, learning, onboarding, offboarding ----
export const useDepartments = () => useQuery({ queryKey: ["departments"], queryFn: () => api.get<any[]>("/departments") });
export const useDepartment = (id?: string) =>
  useQuery({ queryKey: ["department", id], queryFn: () => api.get<any>(`/departments/${id}`), enabled: !!id });

export function useDepartmentMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["departments"] });
  const createDepartment = useMutation({ mutationFn: (data: any) => api.post("/departments", data), onSuccess: invalidate });
  const updateDepartment = useMutation({ mutationFn: ({ id, ...data }: any) => api.patch(`/departments/${id}`, data), onSuccess: invalidate });
  const deleteDepartment = useMutation({ mutationFn: (id: string) => api.delete(`/departments/${id}`), onSuccess: invalidate });
  return { createDepartment, updateDepartment, deleteDepartment };
}

export const useDesignations = () => useQuery({ queryKey: ["designations"], queryFn: () => api.get<any[]>("/designations") });
export const useDesignation = (id?: string) =>
  useQuery({ queryKey: ["designation", id], queryFn: () => api.get<any>(`/designations/${id}`), enabled: !!id });

export function useDesignationMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["designations"] });
  const createDesignation = useMutation({ mutationFn: (data: any) => api.post("/designations", data), onSuccess: invalidate });
  const updateDesignation = useMutation({ mutationFn: ({ id, ...data }: any) => api.patch(`/designations/${id}`, data), onSuccess: invalidate });
  const deleteDesignation = useMutation({ mutationFn: (id: string) => api.delete(`/designations/${id}`), onSuccess: invalidate });
  return { createDesignation, updateDesignation, deleteDesignation };
}

export const useJobRequisitions = () => useQuery({ queryKey: ["job-requisitions"], queryFn: () => api.get<any[]>("/job-requisitions") });
export const useJobRequisition = (id?: string) =>
  useQuery({ queryKey: ["job-requisition", id], queryFn: () => api.get<any>(`/job-requisitions/${id}`), enabled: !!id });
export const useJobApplications = (requisitionId?: string) =>
  useQuery({
    queryKey: ["job-applications", requisitionId],
    queryFn: () => api.get<any[]>(`/job-applications${requisitionId ? `?requisitionId=${requisitionId}` : ""}`),
  });

export function useRecruitmentMutations() {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["job-requisitions"] });
    qc.invalidateQueries({ queryKey: ["job-requisition"] });
    qc.invalidateQueries({ queryKey: ["job-applications"] });
    qc.invalidateQueries({ queryKey: ["employees"] });
    qc.invalidateQueries({ queryKey: ["onboarding-cases"] });
  };
  const createRequisition = useMutation({ mutationFn: (data: any) => api.post("/job-requisitions", data), onSuccess: invalidate });
  const updateRequisition = useMutation({ mutationFn: ({ id, ...data }: any) => api.patch(`/job-requisitions/${id}`, data), onSuccess: invalidate });
  const createApplication = useMutation({
    mutationFn: ({ requisitionId, ...data }: any) => api.post(`/job-requisitions/${requisitionId}/applications`, data),
    onSuccess: invalidate,
  });
  const updateApplicationStage = useMutation({
    mutationFn: ({ id, stage }: any) => api.patch(`/job-applications/${id}/stage`, { stage }),
    onSuccess: invalidate,
  });
  const hireApplication = useMutation({
    mutationFn: ({ id, ...data }: any) => api.post(`/job-applications/${id}/hire`, data),
    onSuccess: invalidate,
  });
  return { createRequisition, updateRequisition, createApplication, updateApplicationStage, hireApplication };
}

export const useTrainingPrograms = () => useQuery({ queryKey: ["training-programs"], queryFn: () => api.get<any[]>("/training-programs") });
export const useTrainingProgram = (id?: string) =>
  useQuery({ queryKey: ["training-program", id], queryFn: () => api.get<any>(`/training-programs/${id}`), enabled: !!id });
export const useTrainingSessions = (programId?: string) =>
  useQuery({
    queryKey: ["training-sessions", programId],
    queryFn: () => api.get<any[]>(`/training-sessions${programId ? `?programId=${programId}` : ""}`),
  });

export function useLearningMutations() {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["training-programs"] });
    qc.invalidateQueries({ queryKey: ["training-program"] });
    qc.invalidateQueries({ queryKey: ["training-sessions"] });
  };
  const createProgram = useMutation({ mutationFn: (data: any) => api.post("/training-programs", data), onSuccess: invalidate });
  const updateProgram = useMutation({ mutationFn: ({ id, ...data }: any) => api.patch(`/training-programs/${id}`, data), onSuccess: invalidate });
  const createSession = useMutation({
    mutationFn: ({ programId, ...data }: any) => api.post(`/training-programs/${programId}/sessions`, data),
    onSuccess: invalidate,
  });
  const updateSession = useMutation({ mutationFn: ({ id, ...data }: any) => api.patch(`/training-sessions/${id}`, data), onSuccess: invalidate });
  const enroll = useMutation({
    mutationFn: ({ sessionId, ...data }: any) => api.post(`/training-sessions/${sessionId}/enrollments`, data),
    onSuccess: invalidate,
  });
  const updateEnrollment = useMutation({
    mutationFn: ({ id, ...data }: any) => api.patch(`/training-enrollments/${id}`, data),
    onSuccess: invalidate,
  });
  return { createProgram, updateProgram, createSession, updateSession, enroll, updateEnrollment };
}

export const useOnboardingCases = () => useQuery({ queryKey: ["onboarding-cases"], queryFn: () => api.get<any[]>("/onboarding-cases") });
export const useOnboardingCase = (id?: string) =>
  useQuery({ queryKey: ["onboarding-case", id], queryFn: () => api.get<any>(`/onboarding-cases/${id}`), enabled: !!id });

export function useOnboardingMutations() {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["onboarding-cases"] });
    qc.invalidateQueries({ queryKey: ["onboarding-case"] });
  };
  const createCase = useMutation({ mutationFn: (data: any) => api.post("/onboarding-cases", data), onSuccess: invalidate });
  const updateTask = useMutation({
    mutationFn: ({ taskId, status }: any) => api.patch(`/onboarding-cases/tasks/${taskId}`, { status }),
    onSuccess: invalidate,
  });
  return { createCase, updateTask };
}

export const useOffboardingCases = () => useQuery({ queryKey: ["offboarding-cases"], queryFn: () => api.get<any[]>("/offboarding-cases") });
export const useOffboardingCase = (id?: string) =>
  useQuery({ queryKey: ["offboarding-case", id], queryFn: () => api.get<any>(`/offboarding-cases/${id}`), enabled: !!id });

export function useOffboardingMutations() {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["offboarding-cases"] });
    qc.invalidateQueries({ queryKey: ["offboarding-case"] });
    qc.invalidateQueries({ queryKey: ["employees"] });
  };
  const createCase = useMutation({ mutationFn: (data: any) => api.post("/offboarding-cases", data), onSuccess: invalidate });
  const updateTask = useMutation({
    mutationFn: ({ taskId, status }: any) => api.patch(`/offboarding-cases/tasks/${taskId}`, { status }),
    onSuccess: invalidate,
  });
  return { createCase, updateTask };
}

// ---- Tasks ----
export function useTasks(filters: Record<string, string | undefined> = {}) {
  const qs = new URLSearchParams(Object.entries(filters).filter(([, v]) => v !== undefined) as [string, string][]).toString();
  return useQuery({ queryKey: ["tasks", filters], queryFn: () => api.get<any[]>(`/tasks${qs ? `?${qs}` : ""}`) });
}
export const useTask = (id?: string) =>
  useQuery({ queryKey: ["task", id], queryFn: () => api.get<any>(`/tasks/${id}`), enabled: !!id });

export function useTaskMutations() {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["tasks"] });
    qc.invalidateQueries({ queryKey: ["task"] });
    qc.invalidateQueries({ queryKey: ["workers-available"] });
  };
  const createTask = useMutation({ mutationFn: (data: any) => api.post("/tasks", data), onSuccess: invalidate });
  const submitTask = useMutation({ mutationFn: (id: string) => api.post(`/tasks/${id}/submit`), onSuccess: invalidate });
  const approveTask = useMutation({ mutationFn: (id: string) => api.post(`/tasks/${id}/approve`), onSuccess: invalidate });
  const rejectTask = useMutation({ mutationFn: (id: string) => api.post(`/tasks/${id}/reject`), onSuccess: invalidate });
  const assignWorker = useMutation({
    mutationFn: ({ taskId, workerId }: { taskId: string; workerId: string }) =>
      api.post(`/tasks/${taskId}/assignments`, { workerId }),
    onSuccess: invalidate,
  });
  const removeAssignment = useMutation({
    mutationFn: ({ taskId, assignmentId }: { taskId: string; assignmentId: string }) =>
      api.delete(`/tasks/${taskId}/assignments/${assignmentId}`),
    onSuccess: invalidate,
  });
  const recordProgress = useMutation({
    mutationFn: ({ taskId, ...data }: any) => api.post(`/tasks/${taskId}/progress`, data),
    onSuccess: invalidate,
  });
  const cancelTask = useMutation({
    mutationFn: ({ taskId, reason }: { taskId: string; reason: string }) => api.post(`/tasks/${taskId}/cancel`, { reason }),
    onSuccess: invalidate,
  });
  const verifyTask = useMutation({ mutationFn: (id: string) => api.post(`/tasks/${id}/verify`), onSuccess: invalidate });
  const carryForward = useMutation({
    mutationFn: ({ taskId, reason }: { taskId: string; reason: string }) => api.post(`/tasks/${taskId}/carry-forward`, { reason }),
    onSuccess: invalidate,
  });
  return { createTask, submitTask, approveTask, rejectTask, assignWorker, removeAssignment, recordProgress, cancelTask, verifyTask, carryForward };
}

// ---- Labour & reassignment ----
export const useLabourRequests = (status?: string) =>
  useQuery({ queryKey: ["labour-requests", status], queryFn: () => api.get<any[]>(`/labour-requests${status ? `?status=${status}` : ""}`) });
export const useReassignmentRequests = (status?: string) =>
  useQuery({ queryKey: ["reassignment-requests", status], queryFn: () => api.get<any[]>(`/reassignment-requests${status ? `?status=${status}` : ""}`) });

export function useLabourMutations() {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["labour-requests"] });
    qc.invalidateQueries({ queryKey: ["reassignment-requests"] });
    qc.invalidateQueries({ queryKey: ["tasks"] });
    qc.invalidateQueries({ queryKey: ["task"] });
    qc.invalidateQueries({ queryKey: ["workers-available"] });
  };
  const createReassignment = useMutation({ mutationFn: (data: any) => api.post("/reassignment-requests", data), onSuccess: invalidate });
  const decideReassignment = useMutation({
    mutationFn: ({ id, approve, notes }: { id: string; approve: boolean; notes?: string }) =>
      api.patch(`/reassignment-requests/${id}/decide`, { approve, notes }),
    onSuccess: invalidate,
  });
  const createLabourRequest = useMutation({ mutationFn: (data: any) => api.post("/labour-requests", data), onSuccess: invalidate });
  const decideLabourRequest = useMutation({
    mutationFn: ({ id, fulfilledCount, notes }: { id: string; fulfilledCount: number; notes?: string }) =>
      api.patch(`/labour-requests/${id}/decide`, { fulfilledCount, notes }),
    onSuccess: invalidate,
  });
  return { createReassignment, decideReassignment, createLabourRequest, decideLabourRequest };
}

// ---- Attendance ----
export const useAttendance = (date?: string) =>
  useQuery({ queryKey: ["attendance", date], queryFn: () => api.get<any[]>(`/attendance${date ? `?date=${date}` : ""}`) });

export function useMarkAttendance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.post("/attendance/mark", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["attendance"] }),
  });
}

// ---- Dashboards ----
export const useManagementDashboard = (farmId?: string) =>
  useQuery({ queryKey: ["dashboard-management", farmId], queryFn: () => api.get<any>(`/dashboard/management?farmId=${farmId}`), enabled: !!farmId });
export const useFarmManagerDashboard = (farmId?: string) =>
  useQuery({ queryKey: ["dashboard-farm-manager", farmId], queryFn: () => api.get<any>(`/dashboard/farm-manager?farmId=${farmId}`), enabled: !!farmId });
export const useSupervisorDashboard = () =>
  useQuery({ queryKey: ["dashboard-supervisor"], queryFn: () => api.get<any>("/dashboard/supervisor") });

// ---- Admin ----
export const useUsers = () => useQuery({ queryKey: ["users"], queryFn: () => api.get<any[]>("/users") });
export const useRoles = () => useQuery({ queryKey: ["roles"], queryFn: () => api.get<any[]>("/users/roles") });
export const useAuditLogs = (params: { entityType?: string; entityId?: string } = {}) => {
  const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v) as [string, string][]).toString();
  return useQuery({ queryKey: ["audit-logs", params], queryFn: () => api.get<any[]>(`/audit-logs${qs ? `?${qs}` : ""}`) });
};

export function useUserMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["users"] });
  const createUser = useMutation({ mutationFn: (data: any) => api.post("/users", data), onSuccess: invalidate });
  const updateUser = useMutation({ mutationFn: ({ id, ...data }: any) => api.patch(`/users/${id}`, data), onSuccess: invalidate });
  const deleteUser = useMutation({ mutationFn: (id: string) => api.delete(`/users/${id}`), onSuccess: invalidate });
  return { createUser, updateUser, deleteUser };
}

// ---- Machinery ----
export const useAssets = (farmId?: string) =>
  useQuery({ queryKey: ["assets", farmId], queryFn: () => api.get<any[]>(`/assets${farmId ? `?farmId=${farmId}` : ""}`) });
export const useAsset = (id?: string) =>
  useQuery({ queryKey: ["asset", id], queryFn: () => api.get<any>(`/assets/${id}`), enabled: !!id });
export const useMaintenanceRequests = (status?: string) =>
  useQuery({ queryKey: ["maintenance-requests", status], queryFn: () => api.get<any[]>(`/maintenance-requests${status ? `?status=${status}` : ""}`) });

export function useMachineryMutations() {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["assets"] });
    qc.invalidateQueries({ queryKey: ["asset"] });
    qc.invalidateQueries({ queryKey: ["maintenance-requests"] });
  };
  const createAsset = useMutation({ mutationFn: (data: any) => api.post("/assets", data), onSuccess: invalidate });
  const updateAsset = useMutation({ mutationFn: ({ id, ...data }: any) => api.patch(`/assets/${id}`, data), onSuccess: invalidate });
  const logUsage = useMutation({ mutationFn: (data: any) => api.post("/machinery-usage", data), onSuccess: invalidate });
  const reportIssue = useMutation({ mutationFn: (data: any) => api.post("/maintenance-requests", data), onSuccess: invalidate });
  const completeMaintenance = useMutation({
    mutationFn: ({ id, ...data }: any) => api.patch(`/maintenance-requests/${id}/complete`, data),
    onSuccess: invalidate,
  });
  return { createAsset, updateAsset, logUsage, reportIssue, completeMaintenance };
}

// ---- Inventory ----
export const useInventoryItems = (farmId?: string) =>
  useQuery({ queryKey: ["inventory-items", farmId], queryFn: () => api.get<any[]>(`/inventory-items${farmId ? `?farmId=${farmId}` : ""}`) });
export const useInventoryBatches = (itemId?: string) =>
  useQuery({ queryKey: ["inventory-batches", itemId], queryFn: () => api.get<any[]>(`/inventory-batches${itemId ? `?itemId=${itemId}` : ""}`) });
export const useStockLocations = () => useQuery({ queryKey: ["stock-locations"], queryFn: () => api.get<any[]>("/stock-locations") });
export const useStockMovements = (itemId?: string) =>
  useQuery({ queryKey: ["stock-movements", itemId], queryFn: () => api.get<any[]>(`/stock-movements${itemId ? `?itemId=${itemId}` : ""}`) });
export const useStockCounts = () => useQuery({ queryKey: ["stock-counts"], queryFn: () => api.get<any[]>("/stock-counts") });

export function useInventoryMutations() {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["inventory-items"] });
    qc.invalidateQueries({ queryKey: ["inventory-batches"] });
    qc.invalidateQueries({ queryKey: ["stock-movements"] });
    qc.invalidateQueries({ queryKey: ["stock-counts"] });
  };
  const createItem = useMutation({ mutationFn: (data: any) => api.post("/inventory-items", data), onSuccess: invalidate });
  const createLocation = useMutation({
    mutationFn: (data: any) => api.post("/stock-locations", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["stock-locations"] }),
  });
  const receiveStock = useMutation({ mutationFn: (data: any) => api.post("/stock-movements/receive", data), onSuccess: invalidate });
  const issueStock = useMutation({ mutationFn: (data: any) => api.post("/stock-movements/issue", data), onSuccess: invalidate });
  const transferBatch = useMutation({ mutationFn: (data: any) => api.post("/stock-movements/transfer", data), onSuccess: invalidate });
  const createStockCount = useMutation({ mutationFn: (data: any) => api.post("/stock-counts", data), onSuccess: invalidate });
  const applyStockCount = useMutation({
    mutationFn: ({ id, ...data }: any) => api.patch(`/stock-counts/${id}/apply`, data),
    onSuccess: invalidate,
  });
  return { createItem, createLocation, receiveStock, issueStock, transferBatch, createStockCount, applyStockCount };
}

// ---- Procurement ----
export const useVendors = (farmId?: string) =>
  useQuery({ queryKey: ["vendors", farmId], queryFn: () => api.get<any[]>(`/vendors${farmId ? `?farmId=${farmId}` : ""}`) });
export const useRequisitions = (status?: string) =>
  useQuery({ queryKey: ["requisitions", status], queryFn: () => api.get<any[]>(`/purchase-requisitions${status ? `?status=${status}` : ""}`) });
export const usePurchaseOrders = (status?: string) =>
  useQuery({ queryKey: ["purchase-orders", status], queryFn: () => api.get<any[]>(`/purchase-orders${status ? `?status=${status}` : ""}`) });

export function useProcurementMutations() {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["vendors"] });
    qc.invalidateQueries({ queryKey: ["requisitions"] });
    qc.invalidateQueries({ queryKey: ["purchase-orders"] });
    qc.invalidateQueries({ queryKey: ["inventory-items"] });
    qc.invalidateQueries({ queryKey: ["inventory-batches"] });
  };
  const createVendor = useMutation({ mutationFn: (data: any) => api.post("/vendors", data), onSuccess: invalidate });
  const createRequisition = useMutation({ mutationFn: (data: any) => api.post("/purchase-requisitions", data), onSuccess: invalidate });
  const decideRequisition = useMutation({
    mutationFn: ({ id, approve }: { id: string; approve: boolean }) => api.patch(`/purchase-requisitions/${id}/decide`, { approve }),
    onSuccess: invalidate,
  });
  const createPurchaseOrder = useMutation({ mutationFn: (data: any) => api.post("/purchase-orders", data), onSuccess: invalidate });
  const createGoodsReceipt = useMutation({ mutationFn: (data: any) => api.post("/goods-receipts", data), onSuccess: invalidate });
  return { createVendor, createRequisition, decideRequisition, createPurchaseOrder, createGoodsReceipt };
}

// ---- Nursery & Seeds ----
export const useSeedLots = (farmId?: string) =>
  useQuery({ queryKey: ["seed-lots", farmId], queryFn: () => api.get<any[]>(`/seed-lots${farmId ? `?farmId=${farmId}` : ""}`) });
export const useSeedLot = (id?: string) =>
  useQuery({ queryKey: ["seed-lot", id], queryFn: () => api.get<any>(`/seed-lots/${id}`), enabled: !!id });
export const useExpiringSeedLots = (farmId?: string) =>
  useQuery({ queryKey: ["seed-lots-expiring", farmId], queryFn: () => api.get<any[]>(`/seed-lots/expiring${farmId ? `?farmId=${farmId}` : ""}`), enabled: !!farmId });
export const useGerminationTrials = (seedLotId?: string) =>
  useQuery({ queryKey: ["germination-trials", seedLotId], queryFn: () => api.get<any[]>(`/germination-trials${seedLotId ? `?seedLotId=${seedLotId}` : ""}`) });
export const useNurseryBatches = (seedLotId?: string) =>
  useQuery({ queryKey: ["nursery-batches", seedLotId], queryFn: () => api.get<any[]>(`/nursery-batches${seedLotId ? `?seedLotId=${seedLotId}` : ""}`) });

export function useNurseryMutations() {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["seed-lots"] });
    qc.invalidateQueries({ queryKey: ["seed-lot"] });
    qc.invalidateQueries({ queryKey: ["seed-lots-expiring"] });
    qc.invalidateQueries({ queryKey: ["germination-trials"] });
    qc.invalidateQueries({ queryKey: ["nursery-batches"] });
  };
  const createSeedLot = useMutation({ mutationFn: (data: any) => api.post("/seed-lots", data), onSuccess: invalidate });
  const addStorageReading = useMutation({ mutationFn: (data: any) => api.post("/seed-storage-readings", data), onSuccess: invalidate });
  const createGerminationTrial = useMutation({ mutationFn: (data: any) => api.post("/germination-trials", data), onSuccess: invalidate });
  const decideGerminationTrial = useMutation({
    mutationFn: ({ id, ...data }: any) => api.patch(`/germination-trials/${id}/decide`, data),
    onSuccess: invalidate,
  });
  const createNurseryBatch = useMutation({ mutationFn: (data: any) => api.post("/nursery-batches", data), onSuccess: invalidate });
  const updateNurseryStage = useMutation({
    mutationFn: ({ id, stage }: { id: string; stage: string }) => api.patch(`/nursery-batches/${id}/stage`, { stage }),
    onSuccess: invalidate,
  });
  return { createSeedLot, addStorageReading, createGerminationTrial, decideGerminationTrial, createNurseryBatch, updateNurseryStage };
}

// ---- Soil & Plant Health ----
export const useSoilTests = (plotId?: string) =>
  useQuery({ queryKey: ["soil-tests", plotId], queryFn: () => api.get<any[]>(`/soil-tests${plotId ? `?plotId=${plotId}` : ""}`) });
export const usePlantHealthRecords = (cropCycleId?: string) =>
  useQuery({ queryKey: ["plant-health-records", cropCycleId], queryFn: () => api.get<any[]>(`/plant-health-records${cropCycleId ? `?cropCycleId=${cropCycleId}` : ""}`) });
export const usePestTreatments = (cropCycleId?: string) =>
  useQuery({ queryKey: ["pest-treatments", cropCycleId], queryFn: () => api.get<any[]>(`/pest-treatments${cropCycleId ? `?cropCycleId=${cropCycleId}` : ""}`) });
export const useAllCropCycles = () => useQuery({ queryKey: ["all-crop-cycles"], queryFn: () => api.get<any[]>("/crop-cycles") });

export function usePlantHealthMutations() {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["soil-tests"] });
    qc.invalidateQueries({ queryKey: ["plant-health-records"] });
    qc.invalidateQueries({ queryKey: ["pest-treatments"] });
  };
  const createSoilTest = useMutation({ mutationFn: (data: any) => api.post("/soil-tests", data), onSuccess: invalidate });
  const createPlantHealthRecord = useMutation({ mutationFn: (data: any) => api.post("/plant-health-records", data), onSuccess: invalidate });
  const createPestTreatment = useMutation({ mutationFn: (data: any) => api.post("/pest-treatments", data), onSuccess: invalidate });
  const completePestTreatment = useMutation({ mutationFn: (id: string) => api.patch(`/pest-treatments/${id}/complete`), onSuccess: invalidate });
  return { createSoilTest, createPlantHealthRecord, createPestTreatment, completePestTreatment };
}

// ---- Organic Inputs ----
export const useOrganicRecipes = () => useQuery({ queryKey: ["organic-recipes"], queryFn: () => api.get<any[]>("/organic-input-recipes") });
export const useOrganicBatches = (recipeId?: string) =>
  useQuery({ queryKey: ["organic-batches", recipeId], queryFn: () => api.get<any[]>(`/organic-input-batches${recipeId ? `?recipeId=${recipeId}` : ""}`) });
export const useInputApplications = (batchId?: string) =>
  useQuery({ queryKey: ["input-applications", batchId], queryFn: () => api.get<any[]>(`/input-applications${batchId ? `?batchId=${batchId}` : ""}`) });

export function useOrganicInputMutations() {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["organic-recipes"] });
    qc.invalidateQueries({ queryKey: ["organic-batches"] });
    qc.invalidateQueries({ queryKey: ["input-applications"] });
  };
  const createRecipe = useMutation({ mutationFn: (data: any) => api.post("/organic-input-recipes", data), onSuccess: invalidate });
  const createBatch = useMutation({ mutationFn: (data: any) => api.post("/organic-input-batches", data), onSuccess: invalidate });
  const createApplication = useMutation({ mutationFn: (data: any) => api.post("/input-applications", data), onSuccess: invalidate });
  return { createRecipe, createBatch, createApplication };
}

// ---- Harvest ----
export const useHarvestForecasts = (cropCycleId?: string) =>
  useQuery({ queryKey: ["harvest-forecasts", cropCycleId], queryFn: () => api.get<any[]>(`/harvest-forecasts${cropCycleId ? `?cropCycleId=${cropCycleId}` : ""}`) });
export const useHarvestBatches = (cropCycleId?: string) =>
  useQuery({ queryKey: ["harvest-batches", cropCycleId], queryFn: () => api.get<any[]>(`/harvest-batches${cropCycleId ? `?cropCycleId=${cropCycleId}` : ""}`) });
export const useForecastVsActual = (cropCycleId?: string) =>
  useQuery({ queryKey: ["forecast-vs-actual", cropCycleId], queryFn: () => api.get<any>(`/harvest-forecasts/${cropCycleId}/vs-actual`), enabled: !!cropCycleId });

export function useHarvestMutations() {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["harvest-forecasts"] });
    qc.invalidateQueries({ queryKey: ["harvest-batches"] });
    qc.invalidateQueries({ queryKey: ["forecast-vs-actual"] });
    qc.invalidateQueries({ queryKey: ["inventory-items"] });
  };
  const createForecast = useMutation({ mutationFn: (data: any) => api.post("/harvest-forecasts", data), onSuccess: invalidate });
  const createHarvestBatch = useMutation({ mutationFn: (data: any) => api.post("/harvest-batches", data), onSuccess: invalidate });
  const addQualityRecord = useMutation({ mutationFn: (data: any) => api.post("/harvest-quality-records", data), onSuccess: invalidate });
  return { createForecast, createHarvestBatch, addQualityRecord };
}

// ---- Distribution ----
export const useRecipients = (farmId?: string) =>
  useQuery({ queryKey: ["recipients", farmId], queryFn: () => api.get<any[]>(`/recipients${farmId ? `?farmId=${farmId}` : ""}`) });
export const useDispatches = (status?: string) =>
  useQuery({ queryKey: ["dispatches", status], queryFn: () => api.get<any[]>(`/dispatches${status ? `?status=${status}` : ""}`) });

export function useDistributionMutations() {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["recipients"] });
    qc.invalidateQueries({ queryKey: ["dispatches"] });
    qc.invalidateQueries({ queryKey: ["inventory-items"] });
  };
  const createRecipient = useMutation({ mutationFn: (data: any) => api.post("/recipients", data), onSuccess: invalidate });
  const createDispatch = useMutation({ mutationFn: (data: any) => api.post("/dispatches", data), onSuccess: invalidate });
  const recordPod = useMutation({
    mutationFn: ({ id, ...data }: any) => api.patch(`/dispatches/${id}/proof-of-delivery`, data),
    onSuccess: invalidate,
  });
  return { createRecipient, createDispatch, recordPod };
}

// ---- Dairy & Livestock ----
export const useAnimals = (farmId?: string) =>
  useQuery({ queryKey: ["animals", farmId], queryFn: () => api.get<any[]>(`/animals${farmId ? `?farmId=${farmId}` : ""}`) });
export const useAnimal = (id?: string) =>
  useQuery({ queryKey: ["animal", id], queryFn: () => api.get<any>(`/animals/${id}`), enabled: !!id });
export const useMilkCollections = (animalId?: string) =>
  useQuery({ queryKey: ["milk-collections", animalId], queryFn: () => api.get<any[]>(`/milk-collections${animalId ? `?animalId=${animalId}` : ""}`) });

export function useDairyMutations() {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["animals"] });
    qc.invalidateQueries({ queryKey: ["animal"] });
    qc.invalidateQueries({ queryKey: ["milk-collections"] });
  };
  const createAnimal = useMutation({ mutationFn: (data: any) => api.post("/animals", data), onSuccess: invalidate });
  const addHealthRecord = useMutation({ mutationFn: (data: any) => api.post("/animal-health-records", data), onSuccess: invalidate });
  const recordMilkCollection = useMutation({ mutationFn: (data: any) => api.post("/milk-collections", data), onSuccess: invalidate });
  const recordMilkQuality = useMutation({ mutationFn: (data: any) => api.post("/milk-quality-tests", data), onSuccess: invalidate });
  return { createAnimal, addHealthRecord, recordMilkCollection, recordMilkQuality };
}

// ---- Processing ----
export const useProductionBatches = (farmId?: string) =>
  useQuery({ queryKey: ["production-batches", farmId], queryFn: () => api.get<any[]>(`/production-batches${farmId ? `?farmId=${farmId}` : ""}`) });

export function useProcessingMutations() {
  const qc = useQueryClient();
  const createProductionBatch = useMutation({
    mutationFn: (data: any) => api.post("/production-batches", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["production-batches"] });
      qc.invalidateQueries({ queryKey: ["inventory-items"] });
    },
  });
  return { createProductionBatch };
}

// ---- Inspections ----
export const useIssues = (params: { status?: string; severity?: string } = {}) => {
  const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v) as [string, string][]).toString();
  return useQuery({ queryKey: ["issues", params], queryFn: () => api.get<any[]>(`/issues${qs ? `?${qs}` : ""}`) });
};

export function useInspectionMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["issues"] });
  const createIssue = useMutation({ mutationFn: (data: any) => api.post("/issues", data), onSuccess: invalidate });
  const resolveMinor = useMutation({ mutationFn: ({ id, ...data }: any) => api.patch(`/issues/${id}/resolve-minor`, data), onSuccess: invalidate });
  const escalate = useMutation({ mutationFn: (id: string) => api.patch(`/issues/${id}/escalate`, {}), onSuccess: invalidate });
  const close = useMutation({ mutationFn: (id: string) => api.patch(`/issues/${id}/close`), onSuccess: invalidate });
  return { createIssue, resolveMinor, escalate, close };
}

// ---- R&D ----
export const useTrials = (farmId?: string) =>
  useQuery({ queryKey: ["trials", farmId], queryFn: () => api.get<any[]>(`/rnd-trials${farmId ? `?farmId=${farmId}` : ""}`) });

export function useRndMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["trials"] });
  const createTrial = useMutation({ mutationFn: (data: any) => api.post("/rnd-trials", data), onSuccess: invalidate });
  const addObservation = useMutation({ mutationFn: (data: any) => api.post("/rnd-trial-observations", data), onSuccess: invalidate });
  const decideTrial = useMutation({ mutationFn: ({ id, ...data }: any) => api.patch(`/rnd-trials/${id}/decide`, data), onSuccess: invalidate });
  return { createTrial, addObservation, decideTrial };
}

// ---- Expenses ----
export const useExpenses = (status?: string) =>
  useQuery({ queryKey: ["expenses", status], queryFn: () => api.get<any[]>(`/expenses${status ? `?status=${status}` : ""}`) });
export const usePettyCash = (farmId?: string) =>
  useQuery({ queryKey: ["petty-cash", farmId], queryFn: () => api.get<any[]>(`/petty-cash${farmId ? `?farmId=${farmId}` : ""}`) });

export function useExpenseMutations() {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["expenses"] });
    qc.invalidateQueries({ queryKey: ["petty-cash"] });
  };
  const createExpense = useMutation({ mutationFn: (data: any) => api.post("/expenses", data), onSuccess: invalidate });
  const decideExpense = useMutation({
    mutationFn: ({ id, approve }: { id: string; approve: boolean }) => api.patch(`/expenses/${id}/decide`, { approve }),
    onSuccess: invalidate,
  });
  const recordPettyCash = useMutation({ mutationFn: (data: any) => api.post("/petty-cash", data), onSuccess: invalidate });
  return { createExpense, decideExpense, recordPettyCash };
}

// ---- Crop Calendar ----
export const useCropCalendars = (cropId?: string) =>
  useQuery({ queryKey: ["crop-calendars", cropId], queryFn: () => api.get<any[]>(`/crop-calendars${cropId ? `?cropId=${cropId}` : ""}`) });
export const useCalendarCompliance = (cropCycleId?: string) =>
  useQuery({ queryKey: ["calendar-compliance", cropCycleId], queryFn: () => api.get<any>(`/crop-cycles/${cropCycleId}/calendar-compliance`), enabled: !!cropCycleId });

export function useCropCalendarMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["crop-calendars"] });
  const createCalendar = useMutation({ mutationFn: (data: any) => api.post("/crop-calendars", data), onSuccess: invalidate });
  const createActivity = useMutation({ mutationFn: (data: any) => api.post("/crop-activities", data), onSuccess: invalidate });
  const generateTasks = useMutation({
    mutationFn: (cropCycleId: string) => api.post(`/crop-cycles/${cropCycleId}/generate-calendar-tasks`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
      qc.invalidateQueries({ queryKey: ["calendar-compliance"] });
    },
  });
  return { createCalendar, createActivity, generateTasks };
}

// ---- Reports ----
export const useDailyActivityReport = (farmId?: string, date?: string) =>
  useQuery({
    queryKey: ["report-daily-activity", farmId, date],
    queryFn: () => api.get<any>(`/reports/daily-activity?farmId=${farmId}${date ? `&date=${date}` : ""}`),
    enabled: !!farmId,
  });
export const useInventoryMovementReport = () =>
  useQuery({ queryKey: ["report-inventory-movement"], queryFn: () => api.get<any[]>("/reports/inventory-movement") });
export const useHarvestForecastReport = (farmId?: string) =>
  useQuery({ queryKey: ["report-harvest-forecast", farmId], queryFn: () => api.get<any[]>(`/reports/harvest-forecast-vs-actual?farmId=${farmId}`), enabled: !!farmId });
export const useExpenseSummaryReport = (farmId?: string) =>
  useQuery({ queryKey: ["report-expense-summary", farmId], queryFn: () => api.get<any>(`/reports/expense-summary?farmId=${farmId}`), enabled: !!farmId });
