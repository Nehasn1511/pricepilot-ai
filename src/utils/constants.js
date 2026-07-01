// ─── Route Paths ──────────────────────────────────────────────
// Use these everywhere instead of typing '/products' as a raw string
export const ROUTES = {
  LOGIN:              '/login',
  DASHBOARD:          '/dashboard',
  PRODUCTS:           '/products',
  PRODUCT_DETAIL:     '/products/:id',
  RECOMMENDATIONS:    '/recommendations',
  RECOMMENDATION_DETAIL: '/recommendations/:id',
  APPROVALS:          '/approvals',
  REPORTS:            '/reports',
  USERS:              '/users',
  MARKETPLACE_ACCOUNTS: '/marketplace-accounts',
  SETTINGS:           '/settings',
};

// ─── Marketplace Names ─────────────────────────────────────────
export const MARKETPLACES = [
  { label: 'Amazon',      value: 'amazon'      },
  { label: 'Flipkart',    value: 'flipkart'    },
  { label: 'Shopify',     value: 'shopify'     },
  { label: 'WooCommerce', value: 'woocommerce' },
  { label: 'Myntra',      value: 'myntra'      },
  { label: 'Meesho',      value: 'meesho'      },
];

// ─── Recommendation Status Values ─────────────────────────────
export const RECOMMENDATION_STATUS = {
  PENDING:  'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  EXPIRED:  'EXPIRED',
};

// ─── Risk Levels ───────────────────────────────────────────────
export const RISK_LEVELS = {
  LOW:    'LOW',
  MEDIUM: 'MEDIUM',
  HIGH:   'HIGH',
};

// ─── Recommendation Types ──────────────────────────────────────
export const RECOMMENDATION_TYPES = [
  'PRICE_MATCH',
  'TEMPORARY_DISCOUNT',
  'STOCK_CLEARANCE',
  'MARGIN_PROTECTION',
  'PRICE_INCREASE',
  'BUNDLE_OFFER',
];

// ─── Product Status ────────────────────────────────────────────
export const PRODUCT_STATUS = {
  ACTIVE:   'ACTIVE',
  INACTIVE: 'INACTIVE',
  DRAFT:    'DRAFT',
};

// ─── Local Storage Keys ────────────────────────────────────────
// Never type these strings raw anywhere else in your code
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER:  'user',
  THEME: 'theme',
};