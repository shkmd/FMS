import {
  LayoutDashboard,
  ClipboardList,
  ListChecks,
  Users,
  CalendarCheck,
  MapPinned,
  Sprout,
  CalendarRange,
  Leaf,
  FlaskConical,
  Beaker,
  Wheat,
  Boxes,
  ShoppingCart,
  Wrench,
  PawPrint,
  Milk,
  Factory,
  Truck,
  ShieldAlert,
  Microscope,
  Wallet,
  FileBarChart,
  Settings,
  ArrowLeftRight,
  Building2,
  IdCard,
  Briefcase,
  GraduationCap,
  LogIn,
  LogOut,
} from "lucide-react";
import { PERMISSIONS } from "@fms/shared";

export interface NavItem {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
  /** Visible if the user holds ANY of these (matches the backend's @RequirePermissions semantics). */
  permission?: string | string[];
  built: boolean;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

const EMPLOYEE_VIEW_OR_MANAGE = [PERMISSIONS.EMPLOYEE_VIEW, PERMISSIONS.EMPLOYEE_MANAGE];

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Operations",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, built: true },
      { label: "Daily Plan", href: "/daily-plan", icon: ClipboardList, permission: PERMISSIONS.TASK_VIEW, built: true },
      { label: "Tasks", href: "/tasks", icon: ListChecks, built: true },
      { label: "Labour Allocation", href: "/labour-allocation", icon: Users, permission: PERMISSIONS.LABOUR_ALLOCATE, built: true },
      { label: "Reassignments", href: "/reassignments", icon: ArrowLeftRight, permission: PERMISSIONS.REASSIGNMENT_REQUEST, built: true },
      { label: "Attendance", href: "/attendance", icon: CalendarCheck, permission: PERMISSIONS.ATTENDANCE_VIEW, built: true },
      { label: "Farm Map", href: "/farm-map", icon: MapPinned, built: true },
    ],
  },
  {
    label: "Workforce",
    items: [
      { label: "Employees", href: "/workforce", icon: Users, permission: EMPLOYEE_VIEW_OR_MANAGE, built: true },
      { label: "Departments", href: "/workforce/departments", icon: Building2, permission: EMPLOYEE_VIEW_OR_MANAGE, built: true },
      { label: "Designations", href: "/workforce/designations", icon: IdCard, permission: EMPLOYEE_VIEW_OR_MANAGE, built: true },
      { label: "Recruitment", href: "/workforce/recruitment", icon: Briefcase, permission: EMPLOYEE_VIEW_OR_MANAGE, built: true },
      { label: "Learning", href: "/workforce/learning", icon: GraduationCap, permission: EMPLOYEE_VIEW_OR_MANAGE, built: true },
      { label: "Onboarding", href: "/workforce/onboarding", icon: LogIn, permission: EMPLOYEE_VIEW_OR_MANAGE, built: true },
      { label: "Offboarding", href: "/workforce/offboarding", icon: LogOut, permission: EMPLOYEE_VIEW_OR_MANAGE, built: true },
    ],
  },
  {
    label: "Cultivation & Crop",
    items: [
      { label: "Cultivation", href: "/cultivation", icon: Sprout, built: true },
      { label: "Crop Calendar", href: "/crop-calendar", icon: CalendarRange, permission: PERMISSIONS.CROP_CALENDAR_MANAGE, built: true },
      { label: "Nursery and Seeds", href: "/nursery-seeds", icon: Leaf, permission: PERMISSIONS.NURSERY_SEEDS_MANAGE, built: true },
      { label: "Soil and Plant Health", href: "/soil-plant-health", icon: FlaskConical, permission: PERMISSIONS.SOIL_PLANT_HEALTH_MANAGE, built: true },
      { label: "Organic Inputs", href: "/organic-inputs", icon: Beaker, permission: PERMISSIONS.ORGANIC_INPUTS_MANAGE, built: true },
      { label: "Harvest", href: "/harvest", icon: Wheat, permission: PERMISSIONS.HARVEST_MANAGE, built: true },
    ],
  },
  {
    label: "Inventory & Procurement",
    items: [
      { label: "Inventory", href: "/inventory", icon: Boxes, permission: [PERMISSIONS.INVENTORY_VIEW, PERMISSIONS.INVENTORY_MANAGE], built: true },
      {
        label: "Procurement",
        href: "/procurement",
        icon: ShoppingCart,
        permission: [PERMISSIONS.PROCUREMENT_MANAGE, PERMISSIONS.PROCUREMENT_APPROVE],
        built: true,
      },
      { label: "Machinery", href: "/machinery", icon: Wrench, permission: [PERMISSIONS.MACHINERY_VIEW, PERMISSIONS.MACHINERY_MANAGE], built: true },
    ],
  },
  {
    label: "Production",
    items: [
      { label: "Livestock", href: "/livestock", icon: PawPrint, permission: PERMISSIONS.DAIRY_MANAGE, built: true },
      { label: "Dairy", href: "/dairy", icon: Milk, permission: PERMISSIONS.DAIRY_MANAGE, built: true },
      { label: "Processing", href: "/processing", icon: Factory, permission: PERMISSIONS.PROCESSING_MANAGE, built: true },
      { label: "Distribution", href: "/distribution", icon: Truck, permission: PERMISSIONS.DISTRIBUTION_MANAGE, built: true },
    ],
  },
  {
    label: "Quality & Compliance",
    items: [
      {
        label: "Inspections",
        href: "/inspections",
        icon: ShieldAlert,
        permission: [PERMISSIONS.ISSUE_CREATE, PERMISSIONS.ISSUE_ESCALATE, PERMISSIONS.ISSUE_VERIFY],
        built: true,
      },
      { label: "R&D", href: "/rnd", icon: Microscope, permission: PERMISSIONS.RND_MANAGE, built: true },
    ],
  },
  {
    label: "Finance & Reports",
    items: [
      { label: "Expenses", href: "/expenses", icon: Wallet, permission: [PERMISSIONS.EXPENSES_MANAGE, PERMISSIONS.EXPENSES_APPROVE], built: true },
      { label: "Reports", href: "/reports", icon: FileBarChart, permission: PERMISSIONS.REPORT_VIEW, built: true },
    ],
  },
  {
    label: "Administration",
    items: [{ label: "Administration", href: "/admin", icon: Settings, permission: PERMISSIONS.USER_MANAGE, built: true }],
  },
];

/** Flat list — used where a single group-agnostic scan is simpler than walking NAV_GROUPS. */
export const NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap((g) => g.items);
