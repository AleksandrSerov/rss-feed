export const state = {
  processState: 'init',
  query: '',
  queryList: [],
  isValidQuery: true,
  isFetching: false,
  isError: false,
  channels: {},
  channelsById: [],
  articlesLists: {},
  articlesListsById: [],
  activeArticlesList: [],
};

export const setState = (params) => {
  Object.keys(params).forEach((param) => {
    state[param] = params[param];
  });
};
