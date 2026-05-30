import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { useAuthSessionSuccess } from "@/features/auth/hooks/use-auth-session-success";
import {
  type SignUpFormValues,
  signUpFormSchema,
} from "@/features/auth/types/sign-up-form";
import { useSignInMutation, useSignUpMutation } from "@/hooks/api/auth";
import { getErrorMessage } from "@/utils/error";

type CreatedCredentials = Pick<SignUpFormValues, "username" | "password">;

export function useSignUpFlow() {
  const handleSessionSuccess = useAuthSessionSuccess();
  const [createdCredentials, setCreatedCredentials] =
    useState<CreatedCredentials | null>(null);

  const {
    isError: isSignUpError,
    error: signUpError,
    isPending: isSignUpPending,
    isSuccess: isSignUpSuccess,
    mutateAsync: signUp,
  } = useSignUpMutation();

  const {
    isError: isSignInError,
    error: signInError,
    isPending: isSignInPending,
    mutateAsync: signIn,
  } = useSignInMutation({
    onSuccess: (data) => {
      setCreatedCredentials(null);
      handleSessionSuccess(data);
    },
  });

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpFormSchema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      username: "",
      password: "",
    },
  });

  const onSubmit: SubmitHandler<SignUpFormValues> = async (values) => {
    await signUp(values);
    setCreatedCredentials({
      username: values.username,
      password: values.password,
    });
  };

  const submitError = isSignUpError
    ? getErrorMessage(signUpError, "Unable to sign up. Please try again.")
    : null;

  const signInSubmitError = isSignInError
    ? getErrorMessage(signInError, "Unable to sign in. Please try again.")
    : null;

  const handleAutoSignIn = () => {
    if (!createdCredentials) return;

    void signIn(createdCredentials).catch(() => undefined);
  };

  return {
    form,
    createdCredentials,
    isSignUpPending,
    isSignUpSuccess,
    isSignInPending,
    submitError,
    signInSubmitError,
    onSubmit,
    handleAutoSignIn,
  };
}
