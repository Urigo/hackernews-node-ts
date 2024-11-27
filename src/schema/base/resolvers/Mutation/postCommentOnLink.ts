import type { MutationResolvers } from "./../../../types.generated";
import { GraphQLError } from "graphql";
import { Prisma } from "@prisma/client";

const parseIntSafe = (value: string): number | null => {
  if (/^(\d+)$/.test(value)) {
    return parseInt(value, 10);
  }
  return null;
};

export const postCommentOnLink: NonNullable<
  MutationResolvers["postCommentOnLink"]
> = async (_parent, args, context) => {
  const linkId = parseIntSafe(args.linkId);
  if (linkId === null) {
    return Promise.reject(
      new GraphQLError(
        `Cannot post comment on non-existing link with id '${args.linkId}'.`,
      ),
    );
  }

  const newComment = await context.prisma.comment
    .create({
      data: {
        linkId: parseInt(args.linkId),
        body: args.body,
      },
    })
    .catch((err: unknown) => {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2003"
      ) {
        return Promise.reject(
          new GraphQLError(
            `Cannot post comment on non-existing link with id '${args.linkId}'.`,
          ),
        );
      }
      return Promise.reject(err);
    });

  return newComment;
};
