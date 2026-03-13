// src/pages/ChangePasswordPage.jsx
import React from "react";
import PasswordForm from "../components/PasswordForm";

export default function ChangePasswordPage() {
  return (
    <PasswordForm
      apiEndpoint="/auth/change-password/"
      redirectTo="/profile"
    />
  );
}