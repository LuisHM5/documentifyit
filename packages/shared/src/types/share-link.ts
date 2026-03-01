export interface ShareLink {
  id: string;
  documentId: string;
  token: string;
  expiresAt: Date | null;
  /** bcrypt-hashed password, null if no password required */
  passwordHash: string | null;
  isActive: boolean;
  createdById: string;
  createdAt: Date;
}
