// Strict feature gating helper.
// Replace `user?.isPro` with your actual source of truth (RevenueCat entitlements, Supabase user flags, etc.).

export const checkAccess = (user: unknown): boolean => {
  const u = user as { isPro?: boolean } | null | undefined;
  // Returns true if user is PRO or in Trial (trial can be encoded in isPro until you expand the model)
  return u?.isPro || false;
};


