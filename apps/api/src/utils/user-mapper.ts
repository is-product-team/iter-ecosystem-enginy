/**
 * Mappers to ensure API responses match the frontend Expected structures (MVP legacy names)
 */

export function mapUserResponse(prismaUser: any) {
  if (!prismaUser) return null;

  return {
    id: prismaUser.id_user,
    id_user: prismaUser.id_user,
    email: prismaUser.email,
    fullName: prismaUser.fullName,
    photoUrl: prismaUser.photoUrl,
    id_center: prismaUser.id_center,
    center: prismaUser.center ? {
      id_center: prismaUser.center.id_center,
      nom_rol: prismaUser.role.roleName
    } : null,
    sync_token: prismaUser.sync_token
  };
}
