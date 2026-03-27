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
    role: prismaUser.role ? prismaUser.role.name : null,
    centerId: prismaUser.id_center,
    id_centre: prismaUser.id_center,
    center: prismaUser.center ? {
      id_center: prismaUser.center.id_center,
      name: prismaUser.center.name,
      centerCode: prismaUser.center.centerCode
    } : null,
    centre: prismaUser.center ? {
      id_center: prismaUser.center.id_center,
      id_centre: prismaUser.center.id_center,
      name: prismaUser.center.name,
      centerCode: prismaUser.center.centerCode
    } : null,
    rol: prismaUser.role ? {
      name: prismaUser.role.name
    } : null,
    sync_token: prismaUser.sync_token
  };
}
