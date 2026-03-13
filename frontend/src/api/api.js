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

/* ---------------- PROFILE ---------------- */

export async function getUserProfile() {
  return await apiRequest("/profile/");
}

/* ---------------- LOGOUT ---------------- */

export function logoutUser() {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
}