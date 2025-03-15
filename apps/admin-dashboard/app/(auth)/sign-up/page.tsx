"use client";

import React from "react";
import AuthForm from "@/components/AuthForm";
import { signUpSchema } from "@/lib/validations";
import { signUp } from "@/lib/actions/auth";

const SignUpPage = () => (
  <AuthForm
    type="SIGN_UP"
    schema={signUpSchema}
    defaultValues={{
      fullName: "",
      email: "",
      password: "",
      role: "CUSTOMER",
    }}
    onSubmit={signUp}
  />
);

export default SignUpPage; 