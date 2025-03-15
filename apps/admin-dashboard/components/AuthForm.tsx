"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  DefaultValues,
  FieldValues,
  Path,
  SubmitHandler,
  useForm,
  UseFormReturn,
} from "react-hook-form";
import { ZodType } from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface Props<T extends FieldValues> {
  schema: ZodType<T>;
  defaultValues: T;
  onSubmit: (data: T) => Promise<{ success: boolean; error?: string }>;
  type: "SIGN_IN" | "SIGN_UP";
}

const AuthForm = <T extends FieldValues>({
  type,
  schema,
  defaultValues,
  onSubmit,
}: Props<T>) => {
  const router = useRouter();

  const isSignIn = type === "SIGN_IN";

  const form: UseFormReturn<T> = useForm({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as DefaultValues<T>,
  });

  const handleSubmit: SubmitHandler<T> = async (data) => {
    const result = await onSubmit(data);

    if (result.success) {
      // Show success message
      alert(isSignIn ? "Signed in successfully!" : "Signed up successfully!");
      router.push("/dashboard");
    } else {
      // Show error message
      alert(result.error || "An error occurred");
    }
  };

  const fieldLabels: Record<string, string> = {
    fullName: "Full Name",
    email: "Email",
    password: "Password",
    role: "Role",
  };

  const fieldTypes: Record<string, string> = {
    fullName: "text",
    email: "email",
    password: "password",
    role: "select",
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-center mb-8">
        <Image 
          src="/assets/images/logo.svg" 
          alt="LoadUp Logo" 
          width={180} 
          height={50} 
          priority
        />
      </div>
      
      <h1 className="text-2xl font-semibold text-gray-900">
        {isSignIn ? "Welcome back to LoadUp" : "Create your LoadUp account"}
      </h1>
      <p className="text-gray-600">
        {isSignIn
          ? "Sign in to access your logistics dashboard"
          : "Please complete all fields to create your account"}
      </p>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="w-full space-y-6"
        >
          {Object.keys(defaultValues).map((field) => (
            <FormField
              key={field}
              control={form.control}
              name={field as Path<T>}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="capitalize">
                    {fieldLabels[field.name] || field.name}
                  </FormLabel>
                  <FormControl>
                    <Input
                      required
                      type={fieldTypes[field.name] || "text"}
                      {...field}
                      className="form-input"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}

          <Button type="submit" className="w-full">
            {isSignIn ? "Sign In" : "Sign Up"}
          </Button>
        </form>
      </Form>

      <p className="text-center text-base font-medium">
        {isSignIn ? "New to LoadUp? " : "Already have an account? "}

        <Link
          href={isSignIn ? "/sign-up" : "/sign-in"}
          className="font-bold text-blue-600"
        >
          {isSignIn ? "Create an account" : "Sign in"}
        </Link>
      </p>
    </div>
  );
};
export default AuthForm; 