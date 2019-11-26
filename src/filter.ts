import { LoaderConfig } from './props-type';

export default function doFilters(filters: Function[], config: LoaderConfig) {
  let promise: Promise<LoaderConfig> = Promise.resolve(config);

  if (filters.length > 0) {
    let isPromiseRejected = false;
    for (let i = 0, len = filters.length; i < len; i++) {
      if (isPromiseRejected) {
        break;
      }

      const filter = filters[i];
      if (typeof filter === 'function') {
        promise = promise
          .then((cfg) => filter(cfg))
          .then((cfg) => cfg || config)
          /* eslint-disable-next-line */
          .catch((error) => {
            isPromiseRejected = true;
            return Promise.reject(error);
          });
      }
    }
  }

  return promise;
}
