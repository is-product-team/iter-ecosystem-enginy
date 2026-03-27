/**
 * Mappers to ensure API responses match the frontend Expected structures (MVP legacy names)
 */

export function mapUserResponse(prismaUser: any) {
  if (!prismaUser) return null;

  return {
    id: prismaUser.userId,
    userId: prismaUser.userId,
    email: prismaUser.email,
    fullName: prismaUser.fullName,
    photoUrl: prismaUser.photoUrl,
    centerId: prismaUser.centerId,
    center: prismaUser.center ? {
      centerId: prismaUser.center.centerId,
      nom_rol: prismaUser.role.roleName
    } : null,
    sync_token: prismaUser.sync_token
  };
}
