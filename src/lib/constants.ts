export const DEMO_USER_ID = "user_demo";

export const PASSWORD_RESET_TOKEN_PREFIX = "reset:";

/**
 * Page sizes for the paginated listings. 21 divides evenly by the grids' 3
 * columns at `lg`, so a full page never leaves a ragged last row.
 */
export const ITEMS_PER_PAGE = 21;
export const COLLECTIONS_PER_PAGE = 21;

/**
 * The dashboard is a summary, not a listing — it shows a fixed slice of each
 * and links out to the paginated pages, so these are caps rather than page
 * sizes.
 */
export const DASHBOARD_COLLECTIONS_LIMIT = 6;
export const DASHBOARD_RECENT_ITEMS_LIMIT = 10;
