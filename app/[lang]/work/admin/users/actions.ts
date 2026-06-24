"use server";

import { revalidatePath } from "next/cache";
import type { Role } from "@/lib/auth";
import {
  deleteUser,
  isEnvSuperAdmin,
  requireSuperAdmin,
  setStoredRole,
} from "@/lib/users";

const ASSIGNABLE_ROLES: Role[] = ["user", "admin", "superAdmin"];

export async function setUserRoleAction(formData: FormData) {
  // Re-check authorization on every call — server actions accept direct POSTs.
  // Only super admins may change roles, including granting super admin.
  const admin = await requireSuperAdmin();
  if (!admin) throw new Error("Unauthorized");

  const id = String(formData.get("id") ?? "");
  const role = String(formData.get("role") ?? "") as Role;
  const lang = String(formData.get("lang") ?? "ko");

  if (!id || !ASSIGNABLE_ROLES.includes(role)) {
    throw new Error("Bad request");
  }
  // The env root super admin is fixed; its DB row is ignored either way.
  if (isEnvSuperAdmin(id)) {
    throw new Error("Cannot change the root super admin");
  }
  // Guard against self-lockout — another super admin must change your role.
  if (id === admin.id) {
    throw new Error("Cannot change your own role");
  }

  await setStoredRole(id, role);
  revalidatePath(`/${lang}/work/admin/users`);
}

export async function deleteUserAction(formData: FormData) {
  const admin = await requireSuperAdmin();
  if (!admin) throw new Error("Unauthorized");

  const id = String(formData.get("id") ?? "");
  const lang = String(formData.get("lang") ?? "ko");
  if (!id) throw new Error("Bad request");
  // Same guards as role changes: the root super admin and your own account
  // can never be removed.
  if (isEnvSuperAdmin(id)) throw new Error("Cannot delete the root super admin");
  if (id === admin.id) throw new Error("Cannot delete your own account");

  await deleteUser(id);
  revalidatePath(`/${lang}/work/admin/users`);
}
