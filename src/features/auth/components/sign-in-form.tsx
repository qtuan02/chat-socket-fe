import { Loader2, MessageCircle } from "lucide-react";
import { Link } from "react-router";
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
import { useSignInFlow } from "@/features/auth/hooks/use-sign-in-flow";
import { cn } from "@/utils/cn";

type SignInFormProps = {
  className?: string;
};

export function SignInForm({ className }: SignInFormProps) {
  const { form, isPending, submitError, onSubmit } = useSignInFlow();
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = form;

  return (
    <form
      noValidate
      className={cn("flex flex-col gap-4 p-6 md:p-8", className)}
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <span className="mb-1 inline-flex items-center gap-2 text-primary">
          <MessageCircle className="size-6" />
          <span className="text-lg font-bold tracking-tight">Chat</span>
        </span>
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
        Don&apos;t have an account?{" "}
        <Link
          to={APP_ROUTES.signUp}
          className="font-medium text-primary hover:underline"
        >
          Sign up
        </Link>
      </FieldDescription>
    </form>
  );
}
