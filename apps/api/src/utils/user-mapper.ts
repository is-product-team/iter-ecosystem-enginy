/**
 * Mappers to ensure API responses match the frontend expected structures (English Standard)
 */

export function mapUserResponse(prismaUser: any) {
  if (!prismaUser) return null;

  // Supports both English property names (Standard) and Catalan (Legacy/Raw)
  const roleData = prismaUser.role || prismaUser.rol;

  return {
    userId: prismaUser.userId || prismaUser.id_user || prismaUser.id_usuari,
    email: prismaUser.email,
    fullName: prismaUser.fullName || prismaUser.nom_complet,
    photoUrl: prismaUser.photoUrl || prismaUser.url_foto,
    centerId: prismaUser.centerId || prismaUser.id_center || prismaUser.id_centre,
    role: {
      roleId: roleData?.roleId || roleData?.id_role || roleData?.id_rol,
      name: roleData?.roleName || roleData?.nom_role || roleData?.nom_rol || roleData?.name,
      roleName: roleData?.roleName || roleData?.nom_role || roleData?.nom_rol || roleData?.name
    },
    center: (prismaUser.center || prismaUser.centre) ? {
      centerId: (prismaUser.center || prismaUser.centre).centerId || (prismaUser.center || prismaUser.centre).id_center || (prismaUser.center || prismaUser.centre).id_centre,
      name: (prismaUser.center || prismaUser.centre).name || (prismaUser.center || prismaUser.centre).nom,
      centerCode: (prismaUser.center || prismaUser.centre).centerCode || (prismaUser.center || prismaUser.centre).codi_center,
      photoUrl: (prismaUser.center || prismaUser.centre).photoUrl || (prismaUser.center || prismaUser.centre).url_foto,
      address: (prismaUser.center || prismaUser.centre).address || (prismaUser.center || prismaUser.centre).adreca,
      contactPhone: (prismaUser.center || prismaUser.centre).contactPhone || (prismaUser.center || prismaUser.centre).telefon_contacte,
      contactEmail: (prismaUser.center || prismaUser.centre).contactEmail || (prismaUser.center || prismaUser.centre).email_contacte
    } : null,
    syncToken: prismaUser.syncToken || prismaUser.sync_token
  };
}
