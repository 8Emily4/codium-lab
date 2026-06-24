"use server";

import { revalidatePath } from "next/cache";
import {
  isEnvSuperAdmin,
  requireSuperAdmin,
  setStoredRole,
} from "@/lib/users";

export async function setUserRoleAction(formData: FormData) {
  // Re-check authorization on every call — server actions accept direct POSTs.
  const admin = await requireSuperAdmin();
  if (!admin) throw new Error("Unauthorized");

  const id = String(formData.get("id") ?? "");
  const role = String(formData.get("role") ?? "");
  const lang = String(formData.get("lang") ?? "ko");

  if (!id || (role !== "admin" && role !== "user")) {
    throw new Error("Bad request");
  }
  if (isEnvSuperAdmin(id)) {
    throw new Error("Cannot change a super admin's role");
  }

  await setStoredRole(id, role);
  revalidatePath(`/${lang}/work/admin/users`);
}
