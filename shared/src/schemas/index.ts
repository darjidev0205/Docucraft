import { z } from 'zod';

export const SignupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(60),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const LoginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const ForgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export const ResetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
});

export const MarginsSchema = z.object({
  top: z.number().min(0).max(100),
  right: z.number().min(0).max(100),
  bottom: z.number().min(0).max(100),
  left: z.number().min(0).max(100),
});

export const HeaderConfigSchema = z.object({
  enabled: z.boolean(),
  logoUrl: z.string().optional(),
  companyName: z.string().optional(),
  documentTitle: z.string().optional(),
  customText: z.string().optional(),
  align: z.enum(['left', 'center', 'right', 'split']),
  borderBottom: z.boolean(),
});

export const FooterConfigSchema = z.object({
  enabled: z.boolean(),
  showPageNumbers: z.boolean(),
  pageNumberFormat: z.enum(['PAGE_OF_TOTAL', 'PAGE_ONLY', 'NUMBER_ONLY']),
  customText: z.string().optional(),
  website: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  align: z.enum(['left', 'center', 'right', 'split']),
  borderTop: z.boolean(),
});

export const DocumentSettingsSchema = z.object({
  pageSize: z.enum(['A4', 'A5', 'Letter']),
  orientation: z.enum(['portrait', 'landscape']),
  marginPreset: z.enum(['normal', 'narrow', 'wide', 'custom']),
  margins: MarginsSchema,
  colors: z.object({
    primary: z.string(),
    secondary: z.string(),
    accent: z.string(),
    background: z.string(),
    text: z.string(),
    surface: z.string(),
  }),
  typography: z.object({
    headingFont: z.string(),
    bodyFont: z.string(),
    baseFontSize: z.number().min(8).max(36),
    lineHeight: z.number().min(1).max(3),
    letterSpacing: z.string().optional(),
  }),
  header: HeaderConfigSchema,
  footer: FooterConfigSchema,
});

export const DocumentPageSchema = z.object({
  id: z.string(),
  pageNumber: z.number().int().min(1),
  contentHtml: z.string(),
  contentJson: z.record(z.any()).optional(),
});

export const CreateDocumentSchema = z.object({
  title: z.string().min(1, 'Title is required').max(150),
  templateId: z.string().default('professional-business'),
  initialContent: z.string().optional(),
  settings: DocumentSettingsSchema.optional(),
});

export const UpdateDocumentSchema = z.object({
  title: z.string().min(1).max(150).optional(),
  templateId: z.string().optional(),
  settings: DocumentSettingsSchema.optional(),
  pages: z.array(DocumentPageSchema).min(1, 'Document must have at least one page').optional(),
  isFavorite: z.boolean().optional(),
  isTrash: z.boolean().optional(),
});

export type SignupInput = z.infer<typeof SignupSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type CreateDocumentInput = z.infer<typeof CreateDocumentSchema>;
export type UpdateDocumentInput = z.infer<typeof UpdateDocumentSchema>;
