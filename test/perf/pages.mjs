// The pages the perf and parity suites exercise. One per distinct layout so a
// regression in any template shows up.
export const PAGES = [
  { id: 'home', url: '/' },
  { id: 'post', url: '/posts/durable-agents/' },
  { id: 'post-short', url: '/posts/sandbox-mcp/' },
  { id: 'posts-list', url: '/posts/' },
  { id: 'about', url: '/about/' },
  { id: 'archives', url: '/archives/' },
  { id: 'categories', url: '/categories/' },
  { id: 'category-term', url: '/categories/featured/' },
  { id: 'books', url: '/books/' },
  { id: 'dailies', url: '/dailies/' },
  { id: 'daily', url: '/dailies/25-3-23-from-bahrain/' },
  { id: 'links', url: '/links/' },
  { id: 'subscribe', url: '/subscribe/' },
  { id: 'notes', url: '/notes/' },
  { id: 'newsletters', url: '/newsletters/' },
  // The blogroll picks one blog at random per build, so its text, its layout
  // height and therefore its pixels legitimately differ between two builds of
  // identical source. Compare structure only.
  { id: 'blogroll', url: '/blogroll/', volatile: true },
  { id: 'stats', url: '/stats/' },
  { id: 'tils', url: '/tils/' },
  { id: 'story', url: '/story/' },
  { id: 'now', url: '/now/' },
  { id: '404', url: '/this-page-does-not-exist/' },
];
