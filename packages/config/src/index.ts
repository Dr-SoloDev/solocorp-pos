// App-wide constants
export const APP_NAME = "SoloCorp POS";
export const APP_DESCRIPTION = "ระบบรับซื้อของเก่า สำหรับคนขายของเก่า";
export const APP_VERSION = "0.1.0";

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const PAGE_SIZES = [10, 20, 50, 100] as const;

// Currency
export const CURRENCY = "THB";
export const CURRENCY_SYMBOL = "฿";
export const LOCALE = "th-TH";

// Date format
export const DATE_FORMAT = "dd/MM/2566"; // Buddhist year
export const DATETIME_FORMAT = "dd/MM/2566 HH:mm";

// POS defaults
export const DEFAULT_VAT_RATE = 0; // 0% VAT for used goods (มือสอง)
export const MAX_DISCOUNT_PERCENT = 100;
export const MIN_TOUCH_TARGET = 44; // px

// Stock thresholds
export const LOW_STOCK_THRESHOLD = 10;
export const CRITICAL_STOCK_THRESHOLD = 3;

// Barcode prefix for internal use
export const INTERNAL_BARCODE_PREFIX = "SC";

// Print settings
export const THERMAL_PRINT_WIDTH_MM = 80;
export const THERMAL_PRINT_CHARS_PER_LINE = 48;
