import { z } from 'zod';
import { TranslationKey } from '../i18n';

export const createLoginSchema = (t: (key: TranslationKey) => string) => {
  return z.object({
    email: z
      .string()
      .trim()
      .min(1, { message: t('emailRequired') })
      .email({ message: t('emailInvalid') }),
    password: z
      .string()
      .min(1, { message: t('passwordRequired') })
      .min(6, { message: t('passwordMinLength') }),
  });
};

export const createRegisterSchema = (t: (key: TranslationKey) => string) => {
  return z
    .object({
      fullName: z
        .string()
        .trim()
        .min(1, { message: t('fullNameRequired') }),
      email: z
        .string()
        .trim()
        .min(1, { message: t('emailRequired') })
        .email({ message: t('emailInvalid') }),
      password: z
        .string()
        .min(1, { message: t('passwordRequired') })
        .min(8, { message: t('passwordMinLength8') }),
      confirmPassword: z
        .string()
        .min(1, { message: t('confirmPasswordRequired') }),
      agreedToTerms: z.boolean().refine((val) => val === true, {
        message: t('termsConsentRequired'),
      }),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t('passwordsMismatch'),
      path: ['confirmPassword'],
    });
};

export type LoginFormValues = z.infer<ReturnType<typeof createLoginSchema>>;
export type RegisterFormValues = z.infer<ReturnType<typeof createRegisterSchema>>;
