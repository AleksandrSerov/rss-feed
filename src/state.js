export const state = {
  processState: 'init',
  query: 'http://www.habrahabr.ru/rss/main/',
  queryList: [],
  isValidQuery: true,
  isFetching: false,
  isError: false,
  channels: {},
  channelsById: [],
  articles: {},
  articlesById: [],
  activeArticlesList: [],
};

export const setState = (params) => {
  Object.keys(params).forEach((param) => {
    state[param] = params[param];
  });
};
