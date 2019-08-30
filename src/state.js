export const state = {
  processState: null,
  query: null,
  queryList: [],
  isValidQuery: false,
  isFetching: false,
  isError: false,
  channels: [],
  articles: [],
};

export const setState = (params) => {
  Object.keys(params).forEach((param) => {
    state[param] = params[param];
  });
};
