import { RouterType } from '@saasfe/we-app-react-router';
import { LoaderConfig, DEFAULTRouterConfig, LoaderConfigRouter } from './props-type';
import { initSkeleton, initApps } from './helper';
import doFilters from './filter';

const version = '1.0.0';

declare global {
  interface Window {
    System: {
      import(name: string): Promise<any>;
    };
  }
}

function microAppLoaderCreator(defaultConfig?: LoaderConfig) {
  let isStarted = false;
  const filters: Function[] = [];

  const singleton = {
    addFilter(filter: Function) {
      if (isStarted) {
        console.warn('加载器已经初始化，不可再添加过滤器');
        return;
      }

      filters.push(filter);
    },

    start: (loaderConfig: LoaderConfig) => {
      isStarted = true;

      const config = Object.assign({
        router: DEFAULTRouterConfig,
        getModuleId(...args: string[]) {
          return args.join('__');
        },
      }, defaultConfig, loaderConfig);

      const promise: Promise<LoaderConfig> = doFilters(filters, config);
      promise
        .then((cfg) => {
          const { skeleton, router } = cfg;

          singleton.router = router as LoaderConfigRouter;

          initSkeleton(skeleton);
          initApps(cfg);
        })
        .catch((error) => {
          console.log('执行初始化中断，因为过滤器返回错误', error);
        });
    },

    router: DEFAULTRouterConfig,
    RouterType,

    version,
  };

  return singleton;
}

export default microAppLoaderCreator();

export { microAppLoaderCreator, RouterType };
