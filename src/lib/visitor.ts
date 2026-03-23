const VISITOR_KEY = 'uhome_visitor_id';

/**
 * Persistent anonymous visitor ID (survives across sessions).
 * Different from session_id which resets per browser session.
 */
export function getVisitorId(): string {
  let id = localStorage.getItem(VISITOR_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(VISITOR_KEY, id);
  }
  return id;
}
