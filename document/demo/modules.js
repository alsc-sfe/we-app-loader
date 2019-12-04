window.System.register('React', [], (exports) => {
  return {
    execute() {
      exports(window.React);
    },
  };
});

window.System.register('ReactDOM', ['React'], (exports) => {
  return {
    setters: [
      function () {},
    ],
    execute() {
      exports(window.ReactDOM);
    },
  };
});

window.System.register('antd', ['React', 'ReactDOM'], (exports) => {
  return {
    setters: [
      function () {},
    ],
    execute() {
      exports(window.antd);
    },
  };
});
