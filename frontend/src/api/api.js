/* ---------------- CREATE SUPERADMIN (ADMIN ONLY) ---------------- */
export async function createSuperAdmin({ first_name, last_name, email, phone_number, password, confirm_password }) {
  return await apiRequest("/create-superadmin/", {
    method: "POST",
    body: JSON.stringify({
      first_name,
      last_name,
      email,
      phone_number,
      password,
      confirm_password
    })
  });
}
import { apiRequest } from "./client";

/* ---------------- LOGIN ---------------- */

export async function loginUser(email, password) {
  const data = await apiRequest("/login/", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  localStorage.setItem("access", data.access);
  localStorage.setItem("refresh", data.refresh);

  return data;
}

/* ---------------- REGISTER ---------------- */

export async function registerUser({ first_name, last_name, email, password }) {
  const data = await apiRequest("/register/", {
    method: "POST",
    body: JSON.stringify({ first_name, last_name, email, password, confirm_password: password }),
  });

  localStorage.setItem("access", data.access);
  localStorage.setItem("refresh", data.refresh);

  return data;
}

/* ---------------- PROFILE ---------------- */

export async function getUserProfile() {
  return await apiRequest("/profile/");
}

/* ---------------- CHANGE PASSWORD ---------------- */

export async function changePassword(oldPassword, newPassword, confirmPassword) {
  return await apiRequest("/password-change/", {
    method: "POST",
    body: JSON.stringify({ old_password: oldPassword, new_password: newPassword, confirm_password: confirmPassword }),
  });
}

/* ---------------- LOGOUT ---------------- */

export function logoutUser() {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
}