module.exports = {
  // 模板类型 pc | h5
  viewType: 'pc',
  componentId: "532",
  componentType: "koubei-b-pc-ts",
  webpack: {
    // 主题配置
    themes: {},
    // devServer配置
    devServer: {
      host: 'local.koubei.test',
      port: 8000,
    },
    // 自定义构建配置、config为全局的构建配置
    config: (webpackConfig) => {
      return webpackConfig;
    }
  },
  runtime: {
    heads: [
      `
      <link rel="stylesheet" href="https://gw.alipayobjects.com/os/lib/antd/3.25.2/dist/antd.min.css">

      <script src="https://gw.alipayobjects.com/os/lib/core-js-bundle/3.1.4/minified.js" crossorigin="anonymous"></script>
      <script src="https://gw.alipayobjects.com/os/lib/regenerator-runtime/0.13.3/runtime.js" crossorigin="anonymous"></script>
      <script src="https://gw.alipayobjects.com/os/lib/systemjs/6.1.4/dist/system.min.js" crossorigin="anonymous"></script>
      <script src="https://gw.alipayobjects.com/os/lib/moment/2.24.0/min/moment.min.js" crossorigin="anonymous"></script>
      <script src="https://gw.alipayobjects.com/os/lib/moment/2.24.0/locale/zh-cn.js" crossorigin="anonymous"></script>
      <script src="https://gw.alipayobjects.com/os/lib/antd/3.25.2/dist/antd-with-locales.min.js" crossorigin="anonymous"></script>
      `,
      `
      <script>
      window.MICRO_APPNAME = '';
      </script>
      `,
      `
      <style>
        html,body {
          height: 100%;
          background: #f5f5f5;
        }
        .microfe-layout {
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        .microfe-menu {
          height: 100%;
        }
        .microfe-body {
          flex: 1;
          height: 100%;
          overflow: auto;
          display: flex;
        }
        .microfe-wrapper {
          flex: 1;
          overflow: auto;
        }
        .microfe-root-body {
          position: relative;
          height: 100%;
          min-width: 1060px;
        }
        body.body-min .microfe-root-body {
          min-width: 1180px;
        }
        .microfe-root-content {
          height: 100%;
        }
        .microfe-module,
        .microfe-module>div {
          height: 100%;
        }
      </style>
      `
    ],
    bodies: [
      `
      <script type="systemjs-importmap">
        {
          "imports": {
            "AntDesignIcons": "https://gw.alipayobjects.com/os/lib/ant-design/icons/2.1.1/lib/umd.js",
            "saas-fetch": "https://gw.alipayobjects.com/os/mentor/saas-fetch/2.0.6/umd/saas-fetch-min.js",
            "saas-fetch-mtop": "https://gw.alipayobjects.com/os/mentor/saas-fetch-mtop/1.0.9/umd/saas-fetch-mtop.js"
          }
        }
      </script>

      <div id="microfe-layout" class="microfe-layout">
        <div class="microfe-navbar" id="bcommon__navbar"></div>
        <div class="microfe-body">
          <div class="microfe-menu" id="bcommon__menu"></div>
          <div class="microfe-wrapper">
            <div class="microfe-root-body">
              <div class="microfe-root-content" id="__microfe-root-content"></div>
            </div>
          </div>
        </div>
      </div>
      `
    ],
    antd: {
      cdn: true,
    },
  },
};
