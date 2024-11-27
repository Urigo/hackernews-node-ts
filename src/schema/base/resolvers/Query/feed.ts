import type { QueryResolvers } from "./../../../types.generated";
import { GraphQLError } from "graphql";

const applyTakeConstraints = (params: {
  min: number;
  max: number;
  value: number;
}) => {
  if (params.value < params.min || params.value > params.max) {
    throw new GraphQLError(
      `'take' argument value '${params.value}' is outside the valid range of '${params.min}' to '${params.max}'.`,
    );
  }
  return params.value;
};

const applySkipConstraints = (value: number) => {
  if (value < 0) {
    throw new GraphQLError(
      `'skip' argument value '${value}' is invalid, value must be positive.`,
    );
  }
  return value;
};

export const feed: NonNullable<QueryResolvers["feed"]> = async (
  _parent,
  args,
  context,
) => {
  const where = args.filterNeedle
    ? {
        OR: [
          { description: { contains: args.filterNeedle } },
          { url: { contains: args.filterNeedle } },
        ],
      }
    : {};

  const take = applyTakeConstraints({
    min: 1,
    max: 50,
    value: args.take ?? 30,
  });

  const skip = applySkipConstraints(args.skip ?? 0);

  return context.prisma.link.findMany({
    where,
    skip,
    take,
  });
};
