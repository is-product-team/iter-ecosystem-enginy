/**
 * Mappers to ensure API responses match the frontend Expected structures (MVP legacy names)
 */

export function mapUserResponse(prismaUser: any) {
  if (!prismaUser) return null;

  return {
    id: prismaUser.id_user,
    id_usuari: prismaUser.id_user,
    email: prismaUser.email,
    nom_complet: prismaUser.nom_complet,
    url_foto: prismaUser.url_foto,
    id_centre: prismaUser.id_center,
    centre: prismaUser.center ? {
      id_centre: prismaUser.center.id_center,
      nom: prismaUser.center.nom
    } : null,
    rol: prismaUser.role ? {
      nom_rol: prismaUser.role.nom_role
    } : null,
    sync_token: prismaUser.sync_token
  };
}
