import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";

type Store = {
  byCustomerId: Record<
    string,
    {
      licenseKey: string;
      plan?: string;
      createdAt: string;
    }
  >;
  byCheckoutSessionId: Record<
    string,
    {
      licenseKey: string;
      plan?: string;
      customerId?: string;
      subscriptionId?: string;
      createdAt: string;
    }
  >;
};

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_PATH = path.join(DATA_DIR, "license-db.json");

function safeReadStore(): Store {
  try {
    if (!fs.existsSync(STORE_PATH)) {
      return { byCustomerId: {}, byCheckoutSessionId: {} };
    }
    const raw = fs.readFileSync(STORE_PATH, "utf8");
    const parsed = JSON.parse(raw) as Store;
    return {
      byCustomerId: parsed.byCustomerId ?? {},
      byCheckoutSessionId: parsed.byCheckoutSessionId ?? {},
    };
  } catch {
    // If the file is corrupted / unreadable, start a fresh store.
    // For production you should replace this with a real DB.
    return { byCustomerId: {}, byCheckoutSessionId: {} };
  }
}

function safeWriteStore(store: Store) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), "utf8");
}

function generateLicenseKey(): string {
  // Format: CKH-XXXX-XXXX-XXXX (you can change pattern anytime)
  const bytes = crypto.randomBytes(12);
  const token = bytes.toString("hex").toUpperCase(); // 24 hex chars
  return `CKH-${token.slice(0, 4)}-${token.slice(4, 8)}-${token.slice(8, 12)}`;
}

export async function ensureLicenseForCustomer(params: {
  customerId: string;
  plan?: string;
}): Promise<string> {
  const { customerId, plan } = params;
  const store = safeReadStore();

  const existing = store.byCustomerId[customerId];
  if (existing?.licenseKey) return existing.licenseKey;

  const licenseKey = generateLicenseKey();
  store.byCustomerId[customerId] = {
    licenseKey,
    plan,
    createdAt: new Date().toISOString(),
  };

  safeWriteStore(store);
  return licenseKey;
}

export async function recordCheckoutSession(params: {
  checkoutSessionId: string;
  licenseKey: string;
  plan?: string;
  customerId?: string;
  subscriptionId?: string;
}): Promise<void> {
  const { checkoutSessionId, licenseKey, plan, customerId, subscriptionId } = params;
  const store = safeReadStore();

  store.byCheckoutSessionId[checkoutSessionId] = {
    licenseKey,
    plan,
    customerId,
    subscriptionId,
    createdAt: new Date().toISOString(),
  };

  safeWriteStore(store);
}

export async function getLicenseByCheckoutSessionId(
  checkoutSessionId: string
): Promise<{ licenseKey: string; plan?: string } | null> {
  const store = safeReadStore();
  const row = store.byCheckoutSessionId[checkoutSessionId];
  if (!row?.licenseKey) return null;
  return { licenseKey: row.licenseKey, plan: row.plan };
}
