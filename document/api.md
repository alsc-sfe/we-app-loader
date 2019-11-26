---
title: 微应用加载器
subtitle: 
cols: 2
---

## API

### 模块入口文件

无论是通过npm依赖引入，还是通过cdn引入，都可以获得两个文件，分别是：

1. `micro-app-loader.js` 不包含默认配置的loader

2. `micro-app-loader-with-config.js` 包含默认配置，如模块容器获取函数、微应用app-config文件获取路径、模块生命周期模板等，
更加详细的请查看源码[default-config.ts](../src/default-config.js)

### 模块API

`micro-app-loader.js` 对外暴露的API如下，

1. `MicroAppLoader` 对象，不包含默认配置的loader实例，实例上挂载的对象或方法如下：
  * `start` 方法，loader运行的方案，接收loaderConfig，loaderConfig详细内容见下方
  * `routerType` 字符串，loaderConfig中配置的routerType，主要是供其他地方取用
  * `RouterType` 枚举，供做routerType声明或比对时使用
2. `window.MicroAppLoader` 对象，同`MicroAppLoader`，只是暴露到全局中，供其他地方使用
3. `microAppLoaderCreator` 方法，用于一些特殊定制场景，如需要生成包含默认配置的loader实例，接收loaderConfig作为参数
4. `RouterType` 枚举，供做routerType声明或比对时使用

### LoaderConfig

`lifecycleTemplateFunction` 生命周期生成函数，接收参数 { getModule, moduleContainer }
  * `getModule` 模块获取函数，返回Promise<模块对应组件>
  * `moduleContainer` 模块渲染容器

```javascript
{
  // 整个产品的路由类型
  routerType: RouterType.hash,
  // 可选，初始时产品的页面框架，可以指定html结构和css样式文件url
  // 建议将html结构和css直接写在产品的初始html里，特殊情况才使用skeleton
  skeleton?: {
    html: '',
    css: '',
  },
  // 微应用列表，一般指定微应用的app-config.js的url即可
  // 特殊情况，支持指定加载的模块
  microApps: [
    {
      // 微应用app-config.js的url或路径
      microAppConfigPath: '',
      // 以下部分，如有特殊定制需求，才使用
      // 微应用名称，在微应用管理平台上注册的唯一名称
      microAppName: '',
      // 指定当前微应用需要加载的模块，优先级最高
      modules: [
        {
          moduleName: '',
          getComponent() => Promise<Component>,
          route: '',
          lifecycle: {},
        },
      ],
      // 指定当前微应用需要加载的模块，优先级低于modules
      getModules(modules) => modules,
    },
  ],
  // 获取微应用app-config.js的完整url
  getMicroAppConfigPath(microAppConfigPath) => microAppConfigPath,
  // 获取模块的唯一ID
  getModuleId(microAppName, moduleName) => moduleId,
  // 获取微应用的渲染容器
  getModuleContainer(moduleId, {microAppName, moduleName, getModuleId}) => Element,
  // 模块生命周期模板函数
  lifecycleTemplateFunction() => lifecycle,
  // 模块生命周期切面，可以用于做监控等
  lifecycleAspect: {},
}
```

#### lifecycle

这里的生命周期是指模块的生命周期，其参照singleSpa的Application的生命周期。

每个生命周期函数的this，指向内部定义的context，context的内容为：
* `stage` 当前所处的生命周期阶段
* `loaderConfig` loader的配置，去除了skeleton、microApps、lifecycleTemplateFunction、lifecycleAspect
* `microAppConfig` 当前微应用配置，去除了modules、lifecycleTemplateFunction、lifecycleAspect
* `module` 模块配置

这里采用的是对象形式的，以方便进行各个层次的配置合并，如

```javascript
{
  bootstrap(){return Promise<any>;},
  mount(){return Promise<any>;},
  unmount(){return Promise<any>;},
}
```

### app-config.js

微应用的配置，包含生命周期模板函数、生命周期切面和模块列表等，详细配置如下：

```javascript
{
  microAppName: '',
  modules: [],
  lifecycleTemplateFunction() => lifecycle,
  lifecycleAspect: {},
}
```

### RouterType

路由类型的枚举，分别是：

1. `hash` 值为`#/`
2. `browser` 值为`/`

使用时，直接`RouterType.hash`或者`window.MicroAppLoader.RouterType.hash`即可。
