import * as singleSpa from 'single-spa';
import { routeMatch } from '@saasfe/we-app-react-router';
import { LoaderConfig, Skeleton, MicroAppConfig, ModuleComponent,
  Module, LifecycleTemplate, GetModuleContainerConfig, MicroApp,
  GetMicroAppConfigPath, LifecycleAspect, LoaderConfigRouter, DEFAULTRouterConfig } from './props-type';
import { RouteMatchParams } from '@saasfe/we-app-react-router/lib/util/route';

const allActivityFunctions = [];

// 最终加载的模块以loaderConfig中的为准，微应用的配置只是提供相应的数据支持
function getAppModules({
  loaderConfigAppConfig,
  microAppConfig,
}: { loaderConfigAppConfig: MicroApp; microAppConfig: MicroAppConfig }) {
  const { getModules } = loaderConfigAppConfig;
  const { modules = [] } = microAppConfig as MicroAppConfig || {};
  let loaderConfigModules = loaderConfigAppConfig.modules;

  // 未定制直接读取appConfig中的modules
  if (!loaderConfigModules && !getModules) {
    return modules;
  }

  if (!loaderConfigModules && getModules) {
    loaderConfigModules = getModules([...modules]);
  }

  // 将loaderConfig中的app.modules，基于appConfig.modules的数据，组装成当前产品的app.modules
  const intergatedModules: Module[] = [];
  if (loaderConfigModules.length) {
    loaderConfigModules.forEach((loaderConfigModule) => {
      const { moduleName } = loaderConfigModule;
      const appConfigModule = modules.find(module => module.moduleName === moduleName);
      if (appConfigModule) {
        const intergatedModule = Object.assign({}, appConfigModule, loaderConfigModule);
        intergatedModules.push(intergatedModule);
      }
    });
  }

  return intergatedModules;
}

async function getMicroAppConfig({
  loaderConfigAppConfig,
  getMicroAppConfigPath,
}: { loaderConfigAppConfig: MicroApp; getMicroAppConfigPath: GetMicroAppConfigPath }) {
  let microAppConfig;
  const { microAppConfigPath, microAppName, lifecycleTemplateFunction, lifecycleAspect } = loaderConfigAppConfig;

  if (microAppConfigPath) {
    const fullAppConfigPath = getMicroAppConfigPath(microAppConfigPath);
    microAppConfig = (await window.System.import(fullAppConfigPath)).default || {};
  }

  const modules = getAppModules({
    loaderConfigAppConfig,
    microAppConfig,
  });

  // loader传入配置优先级高于微应用本身的配置
  return Object.assign({}, microAppConfig, {
    // microAppName 以微应用配置文件里优先，微应用名称不可随意修改
    microAppName: microAppConfig.microAppName || microAppName,
    lifecycleTemplateFunction: lifecycleTemplateFunction || microAppConfig.lifecycleTemplateFunction,
    lifecycleAspect: lifecycleAspect || microAppConfig.lifecycleAspect,
    modules,
  });
}

function makeLifecycle({
  loaderConfig,
  microAppConfig,
  module,
}: { loaderConfig: LoaderConfig; microAppConfig: MicroAppConfig; module: Module }) {
  const intergratedLifecycle: { [prop: string]: any } = {};

  const lifecycle = getLifecycle({
    loaderConfig,
    microAppConfig,
    module,
  });

  Object.keys(lifecycle).forEach((stage) => {
    // @ts-ignore
    const stageFunction = lifecycle[stage];
    const stageAspect = getLifecycleAspect({
      stage,
      loaderConfig,
      microAppConfig,
    });
    const context = {
      stage,
      loaderConfig: Object.assign({}, loaderConfig, {
        skeleton: undefined,
        microApps: undefined,
        lifecycleTemplateFunction: undefined,
        lifecycleAspect: undefined,
      }),
      microAppConfig: Object.assign({}, microAppConfig, {
        modules: undefined,
        lifecycleTemplateFunction: undefined,
        lifecycleAspect: undefined,
      }),
      module: Object.assign({}, module),
    };
    intergratedLifecycle[stage] = aspect(stageFunction, stageAspect, context);
  });

  return intergratedLifecycle as LifecycleTemplate;
}

function getLifecycle({
  loaderConfig,
  microAppConfig,
  module,
}: { loaderConfig: LoaderConfig; microAppConfig: MicroAppConfig; module: Module }) {
  const { getModuleContainer, getModuleId } = loaderConfig as LoaderConfig;
  const { microAppName } = microAppConfig as MicroAppConfig;
  const { moduleName, Component, getComponent } = module as Module;


  let lifecycleTemplate;
  const loaderConfigLifecycleTemplateFunction = (loaderConfig as LoaderConfig).lifecycleTemplateFunction;
  const appConfigLifecycleTemplateFunction = (microAppConfig as MicroAppConfig).lifecycleTemplateFunction;

  const moduleId = getModuleId(microAppName, moduleName);
  const moduleConfig: GetModuleContainerConfig = {
    module: {
      ...module,
      Component: undefined,
      getComponent: undefined,
      lifecycle: undefined,
    },
    microAppConfig: {
      ...microAppConfig,
      // @ts-ignore
      modules: undefined,
      lifecycleTemplateFunction: undefined,
      lifecycleAspect: undefined,
    },
    loaderConfig: {
      ...loaderConfig,
      skeleton: undefined,
      microApps: undefined,
      getMicroAppConfigPath: undefined,
      getModuleId: undefined,
      getModuleContainer: undefined,
      lifecycleTemplateFunction: undefined,
      lifecycleAspect: undefined,
    },
    getModuleId,
  };
  const config = {
    ...moduleConfig,
    // @ts-ignore
    getModule: () => getModule(Component, getComponent),
    getModuleContainer: () => getModuleContainer(moduleId, moduleConfig),
  };

  // app的生命周期函数优先级高于loader的
  if (appConfigLifecycleTemplateFunction) {
    lifecycleTemplate = appConfigLifecycleTemplateFunction(config);
  } else if (loaderConfigLifecycleTemplateFunction) {
    lifecycleTemplate = loaderConfigLifecycleTemplateFunction(config);
  }

  const moduleLifeCycle = module.lifecycle;

  return Object.assign({}, lifecycleTemplate, moduleLifeCycle);
}

function getLifecycleAspect({
  stage,
  loaderConfig,
  microAppConfig,
}: { loaderConfig: LoaderConfig; microAppConfig: MicroAppConfig; stage: string }) {
  const loaderConfigLifecycleAspect = loaderConfig.lifecycleAspect || {};
  // @ts-ignore
  const loaderConfigStageAspect = loaderConfigLifecycleAspect[stage] || loaderConfigLifecycleAspect;

  const appConfigLifecycleAspect = microAppConfig.lifecycleAspect || {};
  // @ts-ignore
  const appConfigStageAspect = appConfigLifecycleAspect[stage] || appConfigLifecycleAspect;

  return Object.assign({}, loaderConfigStageAspect, appConfigStageAspect);
}

function aspect(originalFunction: any, aspectConfig: LifecycleAspect, context = this) {
  const { before, after, onError } = aspectConfig;
  return function (...args: any) {
    return new Promise((resolve, reject) => {
      try {
        before && before.apply(context, args);
        originalFunction.apply(context, args).then(
          () => {
            after && after.apply(context, args);
            resolve();
          },
          (error: any) => {
            onError && onError.call(context, args, error);
            reject(error);
          }
        );
      } catch (error) {
        onError && onError.call(context, args, error);
        reject(error);
      }
    });
  };
}

function getModule(
  Component: ModuleComponent | Promise<ModuleComponent> | undefined,
  getComponent: () => Promise<ModuleComponent>
): Promise<ModuleComponent> {
  return (
    (Component && Promise.resolve(Component)) ||
    getComponent()
  )
    .then((app) => {
      return app.default || app;
    });
}

export interface MakeActivityFunctionParam extends RouteMatchParams {
  [prop: string]: any;
}
function makeActivityFunction(config: MakeActivityFunctionParam) {
  const { route, routeIgnore, afterRouteDiscover } = config;

  let activityFunction;

  if (route === true && !routeIgnore) {
    activityFunction = () => {
      afterRouteDiscover && afterRouteDiscover(true);
      return true;
    };
  } else {
    activityFunction = () => {
      const match = routeMatch(config);
      afterRouteDiscover && afterRouteDiscover(match);
      return match;
    };

    allActivityFunctions.push(activityFunction);
  }

  return activityFunction;
}

export function initSkeleton(skeleton: Skeleton = {}) {
  const { html, css } = skeleton;
  if (css) {
    const link = document.createElement('link');
    link.href = css;
    link.rel = 'stylesheet';
    // @ts-ignore
    document.querySelector('head').appendChild(link);
  }

  if (html) {
    let fragment = document.createDocumentFragment();
    let container = document.createElement('div');
    container.innerHTML = html;
    fragment.appendChild(container);

    for (const child of [].slice.call(container.children)) {
      document.body.appendChild(child);
    }
    // @ts-ignore
    container = null;
    // @ts-ignore
    fragment = null;
  }
}

export function initApps(loaderConfig: LoaderConfig) {
  const {
    getModuleId,
    getMicroAppConfigPath,
    microApps = [],
    router = DEFAULTRouterConfig,
  } = loaderConfig as LoaderConfig;

  // 集成的微应用配置
  microApps.forEach((loaderConfigAppConfig: MicroApp) => {
    getMicroAppConfig({
      loaderConfigAppConfig,
      getMicroAppConfigPath,
    }).then((microAppConfig) => {
      const { microAppName, modules } = microAppConfig as MicroAppConfig;

      if (!microAppName) {
        throw new Error('Please specify microAppName in loaderConfig or appConfig');
      }

      modules.forEach((
        module,
        index
      ) => {
        const { moduleName, route, routeIgnore, afterRouteDiscover } = module;

        if (!moduleName) {
          throw new Error(`Please specify moduleName in ${microAppName}.modules[${index}]`);
        }
        if (!route && !routeIgnore) {
          throw new Error(`Please specify route/routeIgnore in ${microAppName}.modules[${index}]`);
        }

        const moduleId = getModuleId(microAppName, moduleName);
        singleSpa.registerApplication(
          moduleId,
          makeLifecycle({
            loaderConfig,
            microAppConfig,
            module,
          }),
          makeActivityFunction({
            route,
            routeIgnore,
            routerType: (router as LoaderConfigRouter).routerType,
            microAppName,
            basename: (router as LoaderConfigRouter).basename,
            afterRouteDiscover,
          }),
        );
      });

      singleSpa.start();
    });
  });

  // 异常情况注册
  // 404
  // singleSpa.registerApplication(
  //   '__MICRO_APP_MODULE_404__',
  //   makeLifecycle({
  //     loaderConfig,
  //     microAppConfig: {
  //       microAppName: '',
  //     },
  //     module: {
  //       moduleName: '404',
  //     }
  //   }),
  //   () => {
  //     let match = false;
  //     for (let i = 0, len = allActivityFunctions.length; len < i; i++) {
  //       match = !allActivityFunctions[i]();
  //       if (match) {
  //         break;
  //       }
  //     }
  //     return match;
  //   }
  // );
}
