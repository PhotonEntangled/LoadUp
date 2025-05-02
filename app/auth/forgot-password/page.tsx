"use client";

import React from 'react';
// import AuthForm from '@/app/auth/_components/AuthForm'; // Deleted component
import { forgotPasswordSchema } from '@/lib/validations';

export default function ForgotPasswordPage() {
  // const defaultValues = {
  //   email: '',
  // };

  // TODO: Implement forgot password functionality compatible with NextAuth
  // This page is temporarily disabled as it depended on the deleted AuthForm.
  return (
    <div>TODO: Implement Forgot Password Page</div>
    // <div className=\"container flex h-screen w-screen flex-col items-center justify-center\">
    //   <div className=\"mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]\">
    //     <div className=\"flex flex-col space-y-2 text-center\">
    //       <h1 className=\"text-2xl font-semibold tracking-tight\">Forgot Password</h1>
    //       <p className=\"text-sm text-muted-foreground\">
    //         Enter your email address and we&apos;ll send you a link to reset your password
    //       </p>
    //     </div>
    //     <AuthForm
    //       formType=\"forgot-password\"
    //       schema={forgotPasswordSchema}
    //       defaultValues={defaultValues}
    //     />
    //     <p className=\"px-8 text-center text-sm text-muted-foreground\">
    //       Remember your password?{' '}
    //       <a href=\"/auth/sign-in\" className=\"underline underline-offset-4 hover:text-primary\">
    //         Sign in
    //       </a>
    //     </p>
    //   </div>
    // </div>
  );
} 