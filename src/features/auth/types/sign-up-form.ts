import { z } from "zod";

export const signUpFormSchema = z.object({
  email: z
    .string({ message: "Email is required." })
    .trim()
    .email({ message: "Please enter a valid email address." }),
  firstName: z
    .string({ message: "First name is required." })
    .trim()
    .min(1, { message: "First name is required." }),
  lastName: z
    .string({ message: "Last name is required." })
    .trim()
    .min(1, { message: "Last name is required." }),
  username: z
    .string({ message: "Username is required." })
    .trim()
    .min(1, { message: "Username is required." }),
  password: z
    .string({ message: "Password is required." })
    .min(6, { message: "Password must be at least 6 characters." }),
});

export type SignUpFormValues = z.infer<typeof signUpFormSchema>;
