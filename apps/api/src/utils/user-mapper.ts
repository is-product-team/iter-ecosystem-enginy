/**
 * Mappers to ensure API responses match the frontend expected structures (English Standard)
 */

export function mapUserResponse(prismaUser: any) {
  if (!prismaUser) return null;

  return {
    userId: prismaUser.userId,
    email: prismaUser.email,
    fullName: prismaUser.fullName,
    photoUrl: prismaUser.photoUrl,
    centerId: prismaUser.centerId,
    role: {
      roleId: prismaUser.role?.roleId,
      name: prismaUser.role?.roleName
    },
    center: prismaUser.center ? {
      centerId: prismaUser.center.centerId,
      name: prismaUser.center.name
    } : null,
    syncToken: prismaUser.syncToken
  };
}
