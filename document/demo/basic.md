---
order: 1
title: demo1
---

PC模板

````html
<div class="microfe-layout">
  <div class="microfe-navbar" id="common__navbar"></div>
  <div class="microfe-body">
    <div class="microfe-menu" id="common__menu"></div>
    <div id="__microfe-root-content"></div>
  </div>
</div>
````

````jsx
import { render } from './helper';
import MicroAppLoader from "@saasfe/we-app-loader";

MicroAppLoader.start({
  // 路由类型
  router: {
    routerType: MicroAppLoader.RouterType.hash,
    basename: '',
  },
  // 渲染容器获取
  getModuleId(...args) {
    return args.join('__');
  },
  // 确定各个微应用渲染的容器节点
  getModuleContainer: (moduleId) => {
    var container = document.querySelector(`#${moduleId}`);
    if (!container) {
        container = document.createElement('div');
        container.id = moduleId;

        const elContent = document.querySelector('#__microfe-root-content');
        elContent.appendChild(container);
    }
    return container;
  },
  // 告诉loader如何获取微应用配置的地址
  getMicroAppConfigPath: (microAppConfigPath) => {
    if (!microAppConfigPath) {
      throw new Error('Please specify microAppConfigPath.');
    }
    if (microAppConfigPath.lastIndexOf('app-config.js') > -1) {
      return microAppConfigPath;
    }
    return `//g.alicdn.com/${microAppConfigPath}/app-config.js`;
  },
  microApps: [
    {
      microAppConfigPath: 'alsc-saas/web-boh-common/1.2.7',
      
      getModules: function(modules) {
        const module = modules.find(({ moduleName }) => moduleName === 'menu');
        module.afterRouteDiscover = (match) => {
          document.querySelector('#microfe-layout').classList[match ? 'remove' : 'add']('microfe-layout--nomenu');
        };
        return modules;
      },
      
    },
    {
      microAppConfigPath: 'alsc-saas/web-boh-dish/1.0.3',      
    },
    {
      microAppConfigPath: 'alsc-saas/web-crm-member/1.3.2',
    },
  ],
  lifecycleTemplateFunction({
    module,
    microAppConfig,
    loaderConfig,
    getModule,
    getModuleContainer,
  }) {
    let appPromise;
    const { noLoading, route, routeIgnore, unmountRemoveContainer = true, layout = {} } = module;

    return {
      bootstrap: () => {
        appPromise = getModule();
        return Promise.resolve(appPromise);
      },
      mount: () => appPromise
        .then((App) => {
          const moduleContainer = getModuleContainer();

          render(
            React.createElement(App),
            moduleContainer,
          );
        }),
      unmount: () => {
        const moduleContainer = getModuleContainer();

        ReactDOM.unmountComponentAtNode(moduleContainer);

        unmountRemoveContainer && moduleContainer.parentNode && moduleContainer.parentNode.removeChild(moduleContainer);

        return Promise.resolve();
      },
    };
  },
});
````
