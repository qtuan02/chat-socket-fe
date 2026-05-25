import { type SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSignInMutation } from "@/hooks/api/auth";
import { getErrorMessage } from "@/utils/error";
import { useAuthSessionSuccess } from "@/features/auth/hooks/use-auth-session-success";
import {
  type SignInFormValues,
  signInFormSchema,
} from "@/features/auth/types/sign-in-form";

export function useSignInFlow() {
  const handleSessionSuccess = useAuthSessionSuccess();
  const { isError, error, isPending, mutateAsync } = useSignInMutation({
    onSuccess: handleSessionSuccess,
  });

  const form = useForm<SignInFormValues>({
    resolver: zodResolver(signInFormSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const submitError = isError
    ? getErrorMessage(error, "Unable to sign in. Please try again.")
    : null;

  const onSubmit: SubmitHandler<SignInFormValues> = async (values) => {
    await mutateAsync(values);
  };

  return {
    form,
    isPending,
    submitError,
    onSubmit,
  };
}
