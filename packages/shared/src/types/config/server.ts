import type { IncomingMessage, ServerResponse } from 'http';
import type { ServerOptions as HttpsServerOptions } from 'https';
import type {
  Options as BaseProxyOptions,
  Filter as ProxyFilter,
} from '../../../compiled/http-proxy-middleware';

export type HtmlFallback = false | 'index';

export type ProxyDetail = BaseProxyOptions & {
  bypass?: (
    req: IncomingMessage,
    res: ServerResponse,
    proxyOptions: ProxyOptions,
  ) => string | undefined | null | false;
  context?: ProxyFilter;
};

export type ProxyOptions =
  | Record<string, string>
  | Record<string, ProxyDetail>
  | ProxyDetail[]
  | ProxyDetail;

export type HistoryApiFallbackContext = {
  match: RegExpMatchArray;
  parsedUrl: import('url').Url;
  request: Request;
};

export type HistoryApiFallbackOptions = {
  index?: string;
  verbose?: boolean;
  logger?: typeof console.log;
  htmlAcceptHeaders?: string[];
  disableDotRule?: true;
  rewrites?: Array<{
    from: RegExp;
    to: string | RegExp | ((context: HistoryApiFallbackContext) => string);
  }>;
};

export type PrintUrls =
  | boolean
  | ((params: {
      urls: string[];
      port: number;
      protocol: string;
    }) => string[] | void);

export type PublicDir =
  | false
  | {
      /**
       * Directory to serve as static assets
       * @default 'public'
       */
      name?: string;
      /**
       * Whether to copy files from the publicDir to the distDir on production build
       * @default true
       */
      copyOnBuild?: boolean;
    };

export interface ServerConfig {
  /**
   * Whether to enable gzip compression
   */
  compress?: boolean;
  /**
   * Serving static files from the directory (by default 'public' directory)
   */
  publicDir?: PublicDir;
  /**
   * Specify a port number for Rsbuild Server to listen.
   */
  port?: number;
  /**
   * After configuring this option, you can enable HTTPS Server, and disabling the HTTP Server.
   */
  https?: HttpsServerOptions;
  /**
   * Used to set the host of Rsbuild Server.
   */
  host?: string;
  /**
   * Adds headers to all responses.
   */
  headers?: Record<string, string | string[]>;
  /**
   * Whether to support html fallback.
   */
  htmlFallback?: HtmlFallback;
  /**
   * Provide alternative pages for some 404 responses or other requests.
   * see https://github.com/bripkens/connect-history-api-fallback
   */
  historyApiFallback?: boolean | HistoryApiFallbackOptions;
  /**
   * Configure proxy rules for the dev server or preview server to proxy requests to the specified service.
   */
  proxy?: ProxyOptions;
  /**
   * Whether to throw an error when the port is occupied.
   */
  strictPort?: boolean;
  /**
   * Whether to print the server urls when the server is started.
   */
  printUrls?: PrintUrls;
}

export type NormalizedServerConfig = ServerConfig &
  Required<
    Pick<
      ServerConfig,
      | 'htmlFallback'
      | 'port'
      | 'host'
      | 'compress'
      | 'publicDir'
      | 'strictPort'
      | 'printUrls'
    >
  >;
