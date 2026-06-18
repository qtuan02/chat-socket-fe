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
import { useSignUpFlow } from "@/features/auth/hooks/use-sign-up-flow";
import { cn } from "@/utils/cn";

type SignUpFormProps = {
  className?: string;
};

export function SignUpForm({ className }: SignUpFormProps) {
  const {
    form,
    isSignUpPending,
    isSignUpSuccess,
    isSignInPending,
    submitError,
    signInSubmitError,
    onSubmit,
    handleAutoSignIn,
  } = useSignUpFlow();
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = form;

  if (isSignUpSuccess) {
    return (
      <div
        className={cn(
          "flex flex-col items-center gap-4 p-6 text-center md:p-8",
          className,
        )}
      >
        <h1 className="text-2xl font-bold">Account created</h1>
        <p className="text-balance text-muted-foreground">
          Your account has been created successfully. You can sign in now.
        </p>
        <div className="flex w-full max-w-md flex-col gap-3 rounded-lg border bg-muted/40 p-4 text-left sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium text-foreground">
            Would you like to sign in now?
          </p>
          <Button
            type="button"
            disabled={isSignInPending}
            onClick={handleAutoSignIn}
            className="sm:w-auto"
          >
            {isSignInPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Yes, sign in"
            )}
          </Button>
        </div>
        {signInSubmitError ? (
          <p role="alert" className="text-sm font-medium text-destructive">
            {signInSubmitError}
          </p>
        ) : null}
        <Button asChild variant="link" className="h-auto p-0">
          <Link to={APP_ROUTES.signIn}>Go to sign in instead</Link>
        </Button>
      </div>
    );
  }

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
        <h1 className="text-2xl font-bold">Create account</h1>
        <p className="text-balance text-muted-foreground">
          Create your Chat application account
        </p>
      </div>

      <FieldGroup className="gap-4">
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            {...register("email")}
            aria-invalid={!!errors.email}
          />
          <FieldError
            errors={
              errors.email ? [{ message: errors.email.message }] : undefined
            }
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="first-name">First name</FieldLabel>
          <Input
            id="first-name"
            type="text"
            autoComplete="given-name"
            placeholder="Tuan"
            {...register("firstName")}
            aria-invalid={!!errors.firstName}
          />
          <FieldError
            errors={
              errors.firstName
                ? [{ message: errors.firstName.message }]
                : undefined
            }
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="last-name">Last name</FieldLabel>
          <Input
            id="last-name"
            type="text"
            autoComplete="family-name"
            placeholder="Huynh"
            {...register("lastName")}
            aria-invalid={!!errors.lastName}
          />
          <FieldError
            errors={
              errors.lastName
                ? [{ message: errors.lastName.message }]
                : undefined
            }
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="username">Username</FieldLabel>
          <Input
            id="username"
            type="text"
            autoComplete="username"
            placeholder="tuanhq02"
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
            autoComplete="new-password"
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

        <Button
          type="submit"
          disabled={isSignUpPending}
          className="w-full mt-4"
        >
          {isSignUpPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Creating account...
            </>
          ) : (
            "Sign up"
          )}
        </Button>

        {submitError ? (
          <p role="alert" className="text-sm font-medium text-destructive">
            {submitError}
          </p>
        ) : null}
      </FieldGroup>

      <FieldDescription className="text-center">
        Already have an account?{" "}
        <Link
          to={APP_ROUTES.signIn}
          className="font-medium text-primary hover:underline"
        >
          Sign in
        </Link>
      </FieldDescription>
    </form>
  );
}
