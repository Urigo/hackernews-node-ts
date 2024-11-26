import { createSchema } from "graphql-yoga";
import type { Link, Comment } from "@prisma/client";
import { Prisma } from "@prisma/client";
import { GraphQLError } from "graphql";
import type { GraphQLContext } from "./context";

const typeDefinitions = /* GraphQL */ `
  type Query {
    info: String!
    feed: [Link!]!
    comment(id: ID!): Comment
    link(id: ID!): Link
  }

  type Mutation {
    postLink(url: String!, description: String!): Link!
    postCommentOnLink(linkId: ID!, body: String!): Comment!
  }

  type Link {
    id: ID!
    description: String!
    url: String!
    comments: [Comment!]!
  }

  type Comment {
    id: ID!
    createdAt: String!
    body: String!
    link: Link!
  }
`;

const resolvers = {
  Query: {
    info: () => `This is the API of a Hackernews Clone`,
    // 3
    feed: async (parent: unknown, args: {}, context: GraphQLContext) => {
      return context.prisma.link.findMany();
    },
    async comment(
      parent: unknown,
      args: { id: string },
      context: GraphQLContext,
    ) {
      return context.prisma.comment.findUnique({
        where: { id: parseInt(args.id) },
      });
    },
    async link(parent: unknown, args: { id: string }, context: GraphQLContext) {
      return context.prisma.link.findUnique({
        where: { id: parseInt(args.id) },
      });
    },
  },
  Mutation: {
    async postLink(
      parent: unknown,
      args: { description: string; url: string },
      context: GraphQLContext,
    ) {
      const newLink = await context.prisma.link.create({
        data: {
          url: args.url,
          description: args.description,
        },
      });
      return newLink;
    },
    async postCommentOnLink(
      parent: unknown,
      args: { linkId: string; body: string },
      context: GraphQLContext,
    ) {
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
    },
  },
  // 4
  Link: {
    id: (parent: Link) => parent.id,
    description: (parent: Link) => parent.description,
    url: (parent: Link) => parent.url,
    comments: (parent: Link, args: {}, context: GraphQLContext) => {
      return context.prisma.comment.findMany({
        orderBy: { createdAt: "desc" },
        where: {
          linkId: parent.id,
        },
      });
    },
  },
  Comment: {
    link(parent: Comment, _arg: {}, context: GraphQLContext) {
      return context.prisma.link.findUniqueOrThrow({
        where: {
          id: parent.linkId,
        },
      });
    },
  },
};

export const schema = createSchema({
  resolvers: [resolvers],
  typeDefs: [typeDefinitions],
});
