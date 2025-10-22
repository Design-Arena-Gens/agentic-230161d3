import { z } from 'zod';

export const emailSchema = z.string().trim().min(1, 'Email is required').email('Invalid email');

export const signupSchema = z
  .object({
    email: emailSchema,
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum(['employer', 'seeker']),
    name: z.string().trim().min(1, 'Name is required'),
    company: z.string().trim().optional(),
    skills: z.array(z.string().trim()).optional(),
    experience: z.string().trim().optional(),
    preferredRole: z.string().trim().optional(),
    preferredLocation: z.string().trim().optional()
  })
  .refine(
    (data) => {
      if (data.role === 'employer') {
        return Boolean(data.company?.length);
      }
      return true;
    },
    {
      message: 'Employers must provide company information.'
    }
  );

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required')
});

export const profileUpdateSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  company: z.string().trim().optional(),
  skills: z.array(z.string().trim()).optional(),
  experience: z.string().trim().optional(),
  preferredRole: z.string().trim().optional(),
  preferredLocation: z.string().trim().optional()
});

export const jobCreateSchema = z.object({
  title: z.string().trim().min(3, 'Title is required'),
  description: z.string().trim().min(10, 'Description should be more descriptive'),
  skills: z.array(z.string().trim()).nonempty('Provide at least one skill'),
  location: z.string().trim().min(2, 'Location is required'),
  salary: z.string().trim().optional()
});

export const jobQuerySchema = z.object({
  search: z.string().trim().optional(),
  location: z.string().trim().optional()
});

export const applicationCreateSchema = z.object({
  message: z.string().trim().min(1, 'Message is required').max(1000, 'Message too long')
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type JobCreateInput = z.infer<typeof jobCreateSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
export type ApplicationCreateInput = z.infer<typeof applicationCreateSchema>;
