import { Injectable } from '@nestjs/common';
import { GqlModuleOptions, GqlOptionsFactory } from '@nestjs/graphql';
import { MemcachedCache } from 'apollo-server-cache-memcached';
import { ConsulDatabaseConfig, corsApollOptions } from '@ultimatebackend/common';
import { buildContext } from 'graphql-passport';
import { ConsulConfig, InjectConfig } from '@nestcloud/config';
import { IMemcachedOptions } from '@nestcloud/memcached';

@Injectable()
export class GqlConfigService implements GqlOptionsFactory {
  constructor(
    @InjectConfig() private readonly config: ConsulConfig,
  ) {}

  createGqlOptions(): Promise<GqlModuleOptions> | GqlModuleOptions {
    /* Get memcached config from consul */
    const memcachedOptions = this.config.get<IMemcachedOptions>('memcached');

    /* nitialize cache */
    const cache = new MemcachedCache(
      memcachedOptions.uri,
      { retries: memcachedOptions.retries, retry: memcachedOptions.retry },
    );
    return {
      autoSchemaFile: true,
      path: 'graph',
      cors: corsApollOptions,
      context: ({ req, res }) => buildContext({ req, res }),
      cache,

      /**
       * Enable this at your own detriment. Without this, namespaced mutation won't work,
       * I have taken time to make sure resolvers guards are place in the right places.
       * While extending the application, be careful
       * Here is the reason https://github.com/nestjs/graphql/issues/295
       */
      fieldResolverEnhancers: ['guards', 'interceptors'],
      persistedQueries: {
        cache,
      },
      playground: {
        workspaceName: 'Admin Gateway',
        settings: {
          'editor.theme': 'light',
          'request.credentials': 'same-origin',
        },
      },
    };
  }
}
