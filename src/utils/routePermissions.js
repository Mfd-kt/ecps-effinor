/**
 * Utilitaires pour vérifier les permissions d'accès aux routes
 * 
 * Mapping des routes vers les rôles autorisés
 */

/**
 * Mapping des routes vers les rôles autorisés
 */
const ROUTE_PERMISSIONS = {
  '/dashboard': ['super_admin', 'admin', 'commercial', 'technicien', 'callcenter'],
  '/leads': ['super_admin', 'admin', 'commercial'],
  '/leads/:id': ['super_admin', 'admin', 'commercial'],
  '/admin/blog': ['super_admin', 'admin', 'manager', 'backoffice', 'commercial', 'technicien', 'callcenter'],
  '/admin/blog/new': ['super_admin', 'admin', 'manager', 'backoffice'],
  '/admin/blog/:postId': ['super_admin', 'admin', 'manager', 'backoffice', 'commercial', 'technicien', 'callcenter'],
  '/commandes': ['super_admin', 'admin', 'commercial'],
  '/commandes/:id': ['super_admin', 'admin', 'commercial'],
  '/produits': ['super_admin', 'admin'],
  '/produits/new': ['super_admin', 'admin'],
  '/produits/:id/edit': ['super_admin', 'admin'],
  '/categories': ['super_admin', 'admin'],
  '/utilisateurs': ['super_admin', 'admin'],
  '/utilisateurs/:id': ['super_admin', 'admin'],
  '/utilisateurs/new': ['super_admin', 'admin'],
  '/paramètres/roles': ['super_admin', 'admin'],
  '/paramètres/lead-statuses': ['super_admin', 'admin'],
  '/paramètres/order-statuses': ['super_admin', 'admin'],
  '/visiteurs': ['super_admin', 'admin'],
  '/mon-compte': ['super_admin', 'admin', 'commercial', 'technicien', 'callcenter'],
  '/notifications': ['super_admin', 'admin', 'commercial', 'technicien', 'callcenter'],
};

/**
 * Vérifie si un utilisateur peut accéder à une route
 * 
 * @param {string} route - Route à vérifier (ex: '/produits', '/leads/:id')
 * @param {string} userRole - Rôle de l'utilisateur (ex: 'admin', 'commercial')
 * @returns {boolean} - True si l'utilisateur peut accéder à la route
 */
export const canAccessRoute = (route, userRole) => {
  if (!route || !userRole) {
    if (import.meta.env.DEV) {
      console.log(`[canAccessRoute] Route ou userRole manquant: route=${route}, userRole=${userRole}`);
    }
    return false;
  }

  // Normaliser la route (enlever les paramètres dynamiques pour la comparaison)
  const normalizedRoute = route.replace(/\/:[^/]+/g, '/:id');
  
  // Chercher une correspondance exacte
  if (ROUTE_PERMISSIONS[normalizedRoute]) {
    const allowedRoles = ROUTE_PERMISSIONS[normalizedRoute];
    // Vérifier si le rôle de l'utilisateur est dans la liste des rôles autorisés
    const hasAccess = allowedRoles.includes(userRole) || 
                      (allowedRoles.includes('admin') && userRole === 'super_admin') ||
                      (allowedRoles.includes('super_admin') && (userRole === 'super_admin' || userRole === 'admin'));
    
    if (import.meta.env.DEV) {
      console.log(`[canAccessRoute] Route: ${route}, userRole: ${userRole}, allowedRoles:`, allowedRoles, `hasAccess: ${hasAccess}`);
    }
    
    return hasAccess;
  }

  // Chercher une correspondance partielle (pour les routes avec paramètres)
  for (const [routePattern, allowedRoles] of Object.entries(ROUTE_PERMISSIONS)) {
    // Convertir le pattern en regex
    const pattern = routePattern.replace(/:[^/]+/g, '[^/]+');
    const regex = new RegExp(`^${pattern}$`);
    
    if (regex.test(route)) {
      const hasAccess = allowedRoles.includes(userRole) || 
                        (allowedRoles.includes('admin') && userRole === 'super_admin') ||
                        (allowedRoles.includes('super_admin') && (userRole === 'super_admin' || userRole === 'admin'));
      
      if (import.meta.env.DEV) {
        console.log(`[canAccessRoute] Route pattern: ${routePattern}, userRole: ${userRole}, allowedRoles:`, allowedRoles, `hasAccess: ${hasAccess}`);
      }
      
      return hasAccess;
    }
  }

  // Par défaut, refuser l'accès si la route n'est pas dans le mapping
  if (import.meta.env.DEV) {
    console.log(`[canAccessRoute] Route non trouvée dans le mapping: ${route}`);
  }
  return false;
};

/**
 * Obtient les rôles autorisés pour une route
 * 
 * @param {string} route - Route à vérifier
 * @returns {Array<string>} - Liste des rôles autorisés
 */
export const getAllowedRolesForRoute = (route) => {
  const normalizedRoute = route.replace(/\/:[^/]+/g, '/:id');
  return ROUTE_PERMISSIONS[normalizedRoute] || [];
};

