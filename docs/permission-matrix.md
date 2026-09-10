# Role → Permission Matrix

Source of truth: `packages/shared/src/permissions.ts` (`ROLE_PERMISSIONS`). It is not just documentation
— `prisma/seed.ts` seeds these exact role→permission links into `roles`/`permissions`/`role_permissions`,
and `PermissionsGuard` checks the caller's live permission set against `@RequirePermissions(...)` on
each route. Query the live matrix any time via `GET /api/users/roles` (requires `user:manage` or
`role:manage`).

`SUPER_ADMIN` holds a single `platform:manage` permission that short-circuits every guard — it is
intentionally not enumerated permission-by-permission.

## Milestone 1 permissions × roles

✅ = granted. Roles with no Milestone-1 permissions (e.g. a role that's entirely Phase 2 today) are
omitted from a row where every cell would be blank.

| Permission | Farm Mgr | Chief Coord. | Farm Officer | Sr. Research Officer | Plot Supervisor | Garden Supervisor | Field Inspector | Distribution | Dairy/R&D Asst. | Worker | Top Mgmt | Auditor |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| `farm:manage` | ✅ | | | | | | | | | | | |
| `farm:view` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | | ✅ | ✅ |
| `task:create` | ✅ | ✅ | | ✅ | ✅ | ✅ | | | | | | |
| `task:submit` | ✅ | ✅ | | | ✅ | ✅ | | | | | | |
| `task:approve` | ✅ | | | | | | | | | | | |
| `task:approve_critical` | ✅ | | | | | | | | | | | |
| `task:assign` | ✅ | ✅ | | | ✅ | ✅ | | | | | | |
| `task:update_progress` | ✅ | ✅ | | | ✅ | ✅ | | | | | | |
| `task:complete` | ✅ | | | | ✅ | ✅ | | | | | | |
| `task:verify` | ✅ | | | | | | | | | | | |
| `task:view` / `task:view_own` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅(own) | ✅ | ✅ |
| `labour:allocate` | ✅ | ✅ | | | | | | | | | | |
| `labour:request` | ✅ | ✅ | | | ✅ | ✅ | | | | | | |
| `reassignment:request` | | ✅ | | | ✅ | | | | | | | |
| `reassignment:approve` | ✅ | | | | | | | | | | | |
| `attendance:mark_own` | | | | | | | | | | ✅ | | |
| `attendance:mark_others` | | | ✅ | | ✅ | ✅ | | | | | | |
| `attendance:view` | ✅ | ✅ | ✅ | | ✅ | ✅ | | | | | | |
| `attendance:correct` | | | ✅ | | | | | | | | | |
| `attendance:approve_correction` | ✅ | | | | | | | | | | | |
| `employee:manage` / `:view` | (view) | (view) | ✅(manage) | | | | | | | | (view) | |
| `user:manage` / `role:manage` | | | | | | | | | | | | |
| `audit:view` | ✅ | | | | | | | | | | ✅ | ✅ |
| `media:upload` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | | |

`user:manage`/`role:manage` are granted only to `SUPER_ADMIN` (via `platform:manage`) — no other role
administers accounts, matching spec §4's Super-Admin-only "Manage permissions and master settings".

## Beyond Milestone 1

Every role also holds coarse `<module>:manage`/`:view` permissions for its Phase 2/3 responsibilities
(e.g. `SENIOR_RESEARCH_OFFICER` → `crop_calendar:manage`, `nursery_seeds:manage`, `rnd:manage`;
`FARM_OFFICER` → `procurement:manage`, `inventory:manage`, `expenses:manage`;
`DISTRIBUTION_INCHARGE` → `harvest:manage`, `distribution:manage`). These are already seeded so the
permission surface for a module doesn't change when that module gets built — see
`packages/shared/src/permissions.ts` for the complete list per role.
