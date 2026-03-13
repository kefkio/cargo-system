// src/pages/ResetPasswordPage.jsx
import React from "react";
import { useParams } from "react-router-dom";
import PasswordForm from "../components/PasswordForm";

export default function ResetPasswordPage() {
  const { uid, token } = useParams();

  return (
    <PasswordForm
      apiEndpoint="/auth/password-reset-confirm/"
      tokenData={{ uid, token }}
      redirectTo="/login"
    />
  );
}