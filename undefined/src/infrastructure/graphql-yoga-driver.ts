import { createYoga } from 'graphql-yoga';
import { AbstractGraphQLDriver, GqlModuleOptions } from '@nestjs/graphql';
import { useApolloServerErrors } from '@envelop/apollo-server-errors';
import { useGraphQlJit } from '@envelop/graphql-jit';

export class GraphQLYogaDriver extends AbstractGraphQLDriver {
  async start(options: GqlModuleOptions<any>): Promise<void> {
    options = await this.graphQlFactory.mergeWithSchema(options);

    const { httpAdapter } = this.httpAdapterHost;
    httpAdapter.use(
      '/graphql',
      createYoga({
        schema: options.schema,
        graphiql: true,
        plugins: [useApolloServerErrors(), useGraphQlJit()],
      }),
    );
  }

  async stop() {}
}
