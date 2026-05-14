import { z } from "zod";

export const signInFormSchema = z.object({
  username: z
    .string({ message: "Username is required." })
    .trim()
    .min(1, { message: "Username is required." }),
  password: z.string({ message: "Password is required." }).min(6, {
    message: "Password must be at least 6 characters.",
  }),
});

export type SignInFormValues = z.infer<typeof signInFormSchema>;
