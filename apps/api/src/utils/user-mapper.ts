/**
 * Mappers to ensure API responses match the frontend Expected structures (MVP legacy names)
 */

export function mapUserResponse(prismaUser: any) {
  if (!prismaUser) return null;

  return {
    id: prismaUser.id_user,
    id_user: prismaUser.id_user,
    id_usuari: prismaUser.id_user,
    email: prismaUser.email,
    nom_complet: prismaUser.nom_complet,
    url_foto: prismaUser.url_foto,
    id_center: prismaUser.id_center,
    id_centre: prismaUser.id_center,
    center: prismaUser.center ? {
      id_center: prismaUser.center.id_center,
      id_centre: prismaUser.center.id_center,
      nom: prismaUser.center.nom,
      codi_center: prismaUser.center.codi_center
    } : null,
    centre: prismaUser.center ? {
      id_center: prismaUser.center.id_center,
      id_centre: prismaUser.center.id_center,
      nom: prismaUser.center.nom,
      codi_center: prismaUser.center.codi_center
    } : null,
    rol: prismaUser.role ? {
      nom_rol: prismaUser.role.nom_role
    } : null,
    sync_token: prismaUser.sync_token
  };
}
