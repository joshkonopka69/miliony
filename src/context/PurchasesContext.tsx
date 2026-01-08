import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

/**
 * RevenueCat (react-native-purchases) context.
 *
 * This file is written to be safe even if `react-native-purchases` is not yet installed
 * (we load it dynamically). Once you install/configure RevenueCat in a dev build, it will
 * automatically start working.
 */

// Minimal local types (subset of RevenueCat types we need)
export type PurchasesPackage = {
  identifier: string;
  packageType?: string;
  storeProduct?: {
    priceString?: string;
  };
};

export type PurchasesOffering = {
  identifier: string;
  availablePackages: PurchasesPackage[];
};

type PurchasesOfferings = {
  current: PurchasesOffering | null;
};

type CustomerInfo = {
  entitlements?: {
    active?: Record<string, unknown>;
  };
};

type PurchasesModule = {
  configure: (opts: { apiKey: string; appUserID?: string | null }) => void;
  getOfferings: () => Promise<PurchasesOfferings>;
  getCustomerInfo: () => Promise<CustomerInfo>;
  addCustomerInfoUpdateListener: (listener: (info: CustomerInfo) => void) => void;
  removeCustomerInfoUpdateListener: (listener: (info: CustomerInfo) => void) => void;
  purchasePackage: (pkg: PurchasesPackage) => Promise<{ customerInfo: CustomerInfo }>;
  restorePurchases: () => Promise<CustomerInfo>;
};

type PurchasesContextValue = {
  isPro: boolean;
  currentOffering: PurchasesOffering | null;
  monthlyPackage: PurchasesPackage | null;
  isReady: boolean;
  isBusy: boolean;
  purchasePackage: (pkg: PurchasesPackage) => Promise<void>;
  restorePurchases: () => Promise<void>;
};

const PurchasesContext = createContext<PurchasesContextValue | undefined>(undefined);

const REVENUECAT_API_KEY = 'appl_dummy_key_replace_me';

function isUserCancelledPurchase(err: unknown): boolean {
  const anyErr = err as any;
  const message = typeof anyErr?.message === 'string' ? anyErr.message.toLowerCase() : '';

  // RevenueCat error objects vary by platform/version; keep this defensive.
  return (
    anyErr?.userCancelled === true ||
    anyErr?.code === 'PURCHASE_CANCELLED' ||
    anyErr?.code === 'PurchaseCancelledError' ||
    message.includes('cancel') ||
    message.includes('user cancelled')
  );
}

function pickMonthlyPackage(offering: PurchasesOffering | null): PurchasesPackage | null {
  if (!offering) return null;

  const packages = offering.availablePackages || [];
  const byIdentifier =
    packages.find((p) => p.identifier === '$rc_monthly') ||
    packages.find((p) => p.identifier.toLowerCase().includes('monthly'));
  if (byIdentifier) return byIdentifier;

  // Fallback: if packageType exists and looks like monthly
  const byType = packages.find((p) => (p.packageType || '').toLowerCase().includes('month'));
  return byType || packages[0] || null;
}

function computeIsPro(info: CustomerInfo | null): boolean {
  const active = info?.entitlements?.active || {};
  return Object.keys(active).length > 0;
}

function loadPurchasesModule(): PurchasesModule | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require('react-native-purchases');
    return (mod?.default ?? mod) as PurchasesModule;
  } catch {
    return null;
  }
}

export function PurchasesProvider({ children }: { children: ReactNode }) {
  const purchasesRef = useRef<PurchasesModule | null>(null);
  const customerInfoListenerRef = useRef<((info: CustomerInfo) => void) | null>(null);

  const [isReady, setIsReady] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [currentOffering, setCurrentOffering] = useState<PurchasesOffering | null>(null);

  useEffect(() => {
    const Purchases = loadPurchasesModule();
    purchasesRef.current = Purchases;

    if (!Purchases) {
      console.warn(
        '[PurchasesContext] react-native-purchases not installed. Purchases disabled until you add the dependency and build a dev client.'
      );
      setIsReady(true);
      return;
    }

    try {
      Purchases.configure({ apiKey: REVENUECAT_API_KEY });
    } catch (err) {
      console.error('[PurchasesContext] Purchases.configure failed', err);
      setIsReady(true);
      return;
    }

    const listener = (info: CustomerInfo) => {
      setCustomerInfo(info);
    };
    customerInfoListenerRef.current = listener;
    try {
      Purchases.addCustomerInfoUpdateListener(listener);
    } catch (err) {
      console.error('[PurchasesContext] addCustomerInfoUpdateListener failed', err);
    }

    const boot = async () => {
      try {
        const [offerings, info] = await Promise.all([
          Purchases.getOfferings(),
          Purchases.getCustomerInfo(),
        ]);
        setCurrentOffering(offerings?.current ?? null);
        setCustomerInfo(info ?? null);
      } catch (err) {
        console.error('[PurchasesContext] Failed to load offerings/customer info', err);
      } finally {
        setIsReady(true);
      }
    };

    void boot();

    return () => {
      try {
        const l = customerInfoListenerRef.current;
        if (l) Purchases.removeCustomerInfoUpdateListener(l);
      } catch (err) {
        console.error('[PurchasesContext] removeCustomerInfoUpdateListener failed', err);
      }
    };
  }, []);

  const isPro = useMemo(() => computeIsPro(customerInfo), [customerInfo]);
  const monthlyPackage = useMemo(() => pickMonthlyPackage(currentOffering), [currentOffering]);

  const purchasePackage = useCallback(async (pkg: PurchasesPackage) => {
    const Purchases = purchasesRef.current;
    if (!Purchases) {
      console.error('[PurchasesContext] Purchases not available (missing react-native-purchases).');
      return;
    }

    setIsBusy(true);
    try {
      const res = await Purchases.purchasePackage(pkg);
      setCustomerInfo(res?.customerInfo ?? null);
    } catch (err) {
      if (isUserCancelledPurchase(err)) return; // no alert/log spam on cancel
      console.error('[PurchasesContext] purchasePackage failed', err);
    } finally {
      setIsBusy(false);
    }
  }, []);

  const restorePurchases = useCallback(async () => {
    const Purchases = purchasesRef.current;
    if (!Purchases) {
      console.error('[PurchasesContext] Purchases not available (missing react-native-purchases).');
      return;
    }

    setIsBusy(true);
    try {
      const info = await Purchases.restorePurchases();
      setCustomerInfo(info ?? null);
    } catch (err) {
      console.error('[PurchasesContext] restorePurchases failed', err);
    } finally {
      setIsBusy(false);
    }
  }, []);

  const value: PurchasesContextValue = useMemo(
    () => ({
      isPro,
      currentOffering,
      monthlyPackage,
      isReady,
      isBusy,
      purchasePackage,
      restorePurchases,
    }),
    [currentOffering, isBusy, isPro, isReady, monthlyPackage, purchasePackage, restorePurchases]
  );

  return <PurchasesContext.Provider value={value}>{children}</PurchasesContext.Provider>;
}

export function usePurchases(): PurchasesContextValue {
  const ctx = useContext(PurchasesContext);
  if (!ctx) throw new Error('usePurchases must be used within a PurchasesProvider');
  return ctx;
}


