export type PageSize = 'A4' | 'A5' | 'Letter';
export type Orientation = 'portrait' | 'landscape';
export type Alignment = 'left' | 'center' | 'right' | 'split';
export type MarginPreset = 'normal' | 'narrow' | 'wide' | 'custom';

export interface Margins {
  top: number;    // in mm
  right: number;  // in mm
  bottom: number; // in mm
  left: number;   // in mm
}

export interface HeaderConfig {
  enabled: boolean;
  logoUrl?: string;
  companyName?: string;
  documentTitle?: string;
  customText?: string;
  align: Alignment;
  borderBottom: boolean;
}

export interface FooterConfig {
  enabled: boolean;
  showPageNumbers: boolean;
  pageNumberFormat: 'PAGE_OF_TOTAL' | 'PAGE_ONLY' | 'NUMBER_ONLY'; // e.g. "Page 1 of 3", "Page 1", "1"
  customText?: string;
  website?: string;
  email?: string;
  phone?: string;
  align: Alignment;
  borderTop: boolean;
}

export interface DocumentColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  surface: string;
}

export interface DocumentTypography {
  headingFont: string;
  bodyFont: string;
  baseFontSize: number; // in pt/px
  lineHeight: number;
  letterSpacing?: string;
}

export interface DocumentSettings {
  pageSize: PageSize;
  orientation: Orientation;
  marginPreset: MarginPreset;
  margins: Margins;
  colors: DocumentColorPalette;
  typography: DocumentTypography;
  header: HeaderConfig;
  footer: FooterConfig;
}

export interface DocumentPage {
  id: string;
  pageNumber: number;
  contentHtml: string;
  contentJson?: Record<string, any>;
}

export interface DocumentAsset {
  id: string;
  documentId: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  createdAt: string;
}

export interface DocumentModel {
  id: string;
  userId: string;
  title: string;
  templateId: string;
  settings: DocumentSettings;
  pages: DocumentPage[];
  assets?: DocumentAsset[];
  version: number;
  isFavorite: boolean;
  isTrash: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateDefinition {
  id: string;
  name: string;
  category: 'Business' | 'Academic' | 'Marketing' | 'Resume' | 'Certificate' | 'Report' | 'Creative' | 'Minimal';
  description: string;
  thumbnail: string;
  badge?: string;
  defaultSettings: DocumentSettings;
  sampleContent: {
    title: string;
    pages: Array<{
      contentHtml: string;
    }>;
  };
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
}

export interface AuthResponse {
  user: UserProfile;
  token: string;
}
