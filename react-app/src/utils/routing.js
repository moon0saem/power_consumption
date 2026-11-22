export function resolveRoute(hash, search, validRoutes, aliases = {}) {
  const hashRoute = String(hash || '').match(/^#\/([^/?#]+)/)?.[1]
  const queryRoute = new URLSearchParams(String(search || '')).get('view')
  const resolvedHashRoute = aliases[hashRoute] || hashRoute
  const resolvedQueryRoute = aliases[queryRoute] || queryRoute
  if (resolvedHashRoute && validRoutes.includes(resolvedHashRoute)) return resolvedHashRoute
  if (resolvedQueryRoute && validRoutes.includes(resolvedQueryRoute)) return resolvedQueryRoute
  return 'home'
}
