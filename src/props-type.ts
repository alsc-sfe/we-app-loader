import { RouterType } from '@saasfe/we-app-react-router';
import { Route as TRoute } from '@saasfe/we-app-react-router/es/util/route';

export interface LoaderConfigRouter {
  routerType: RouterType;
  basename: string;
}

export const DEFAULTRouterConfig: LoaderConfigRouter = {
  routerType: RouterType.browser,
  basename: '',
};

export interface LoaderConfig {
  skeleton?: Skeleton;
  // 产品微应用列表
  microApps?: MicroApp[];
  getMicroAppConfigPath: GetMicroAppConfigPath;
  getModuleId: GetModuleId;
  getModuleContainer: GetModuleContainer;

  router?: LoaderConfigRouter;

  lifecycleTemplateFunction?: LifecycleTemplateFunction;
  lifecycleAspect?: LifecycleAspect;
}

export interface Skeleton {
  html?: string;
  css?: string;
}

export interface MicroApp extends MicroAppConfig {
  microAppConfigPath?: string;
  getModules?: (modules: Module[]) => Module[];
}

export interface Module {
  moduleName: string;
  Component?: ModuleComponent | Promise<ModuleComponent>;
  getComponent?: () => Promise<ModuleComponent>;
  route: TRoute;
  routeIgnore: TRoute;
  lifecycle?: LifecycleTemplate;
  [prop: string]: any;
}

export type ModuleComponent = any;

export type GetMicroAppConfigPath = (microAppConfigPath?: string) => string;

export type GetModuleId = (microAppName: string, moduleName: string) => string;

export interface GetModuleContainerConfig {
  microAppConfig: MicroAppConfig;
  module: Module;
  getModuleId: GetModuleId;
  [prop: string]: any;
}

export type GetModuleContainer = (moduleId: string, config: GetModuleContainerConfig) => Element;

interface LifecycleTemplateFunctionConfig extends GetModuleContainerConfig {
  getModule: () => Promise<any>;
  getModuleContainer: () => Element;
}
export type LifecycleTemplateFunction = (config: LifecycleTemplateFunctionConfig) => LifecycleTemplate;

export interface LifecycleTemplate {
  bootstrap: () => Promise<any>;
  mount: () => Promise<any>;
  unmount: () => Promise<any>;
}

export interface LifecycleAspect {
  before: () => void;
  after: () => void;
  onError: () => void;
}

// 微应用配置
export interface MicroAppConfig {
  // 微应用名称
  microAppName: string;
  // 微应用模块列表
  modules: Module[];
  // 生命周期模板
  lifecycleTemplateFunction?: LifecycleTemplateFunction;
  // 生命周期切面
  lifecycleAspect?: LifecycleAspect;
}
