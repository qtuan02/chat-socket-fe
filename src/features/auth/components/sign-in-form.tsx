import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { APP_ROUTES } from "@/config/routes";
import { useSignInMutation } from "@/hooks/api/auth";
import useAuthStore from "@/stores/useAuthStore";
import { cn } from "@/utils/cn";
import { type SignInFormValues, signInFormSchema } from "../types/sign-in-form";

type SignInFormProps = {
  className?: string;
};

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Unable to sign in. Please try again.";
}

export function SignInForm({ className }: SignInFormProps) {
  const navigate = useNavigate();
  const { setAccessToken } = useAuthStore();

  const { isError, error, isPending, mutateAsync } = useSignInMutation({
    onSuccess: (data) => {
      setAccessToken(data.data.accessToken);
      toast.success(data?.message || "Sign in successful.");
      navigate(APP_ROUTES.chat, { replace: true });
    },
  });

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signInFormSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const submitError = isError ? getErrorMessage(error) : null;

  const onSubmit: SubmitHandler<SignInFormValues> = async (values) => {
    await mutateAsync(values);
  };

  return (
    <form
      noValidate
      className={cn("flex flex-col gap-4 p-6 md:p-8", className)}
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <p className="text-balance text-muted-foreground">
          Login to your Chat application
        </p>
      </div>
      <FieldGroup className="gap-4">
        <Field>
          <FieldLabel htmlFor="username">Username</FieldLabel>
          <Input
            id="username"
            type="text"
            autoComplete="username"
            placeholder="your-username"
            {...register("username")}
            aria-invalid={!!errors.username}
          />
          <FieldError
            errors={
              errors.username
                ? [{ message: errors.username.message }]
                : undefined
            }
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            {...register("password")}
            aria-invalid={!!errors.password}
          />
          <FieldError
            errors={
              errors.password
                ? [{ message: errors.password.message }]
                : undefined
            }
          />
        </Field>

        <Button type="submit" disabled={isPending} className="w-full mt-4">
          {isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign in"
          )}
        </Button>

        {submitError ? (
          <p role="alert" className="text-sm font-medium text-destructive">
            {submitError}
          </p>
        ) : null}
      </FieldGroup>
      <FieldDescription className="text-center">
        Don&apos;t have an account? <Link to={APP_ROUTES.signUp}>Sign up</Link>
      </FieldDescription>
    </form>
  );
}
