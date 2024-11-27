import type { CommentResolvers } from "./../../types.generated";
export const Comment: CommentResolvers = {
  link(parent: Comment, _arg: {}, context: GraphQLContext) {
    return context.prisma.link.findUnique({
      where: {
        id: parent.linkId,
      },
    });
  },
};
