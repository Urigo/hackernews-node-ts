import type { LinkResolvers } from "./../../types.generated";
/*
 * Note: This object type is generated because "LinkMapper" is declared. This is to ensure runtime safety.
 *
 * When a mapper is used, it is possible to hit runtime errors in some scenarios:
 * - given a field name, the schema type's field type does not match mapper's field type
 * - or a schema type's field does not exist in the mapper's fields
 *
 * If you want to skip this file generation, remove the mapper or update the pattern in the `resolverGeneration.object` config.
 */
export const Link: LinkResolvers = {
  /* Implement Link resolver logic here */
  comments: (parent, _arg, context) => {
    return context.prisma.comment.findMany({
      orderBy: { createdAt: "desc" },
      where: {
        linkId: parent.id,
      },
    });
  },
};
