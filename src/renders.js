import { state } from './state';

const cards = document.getElementById('cardsList');
const articlesList = document.getElementById('articlesList');

export const renderArticlesList = () => {
  const { activeArticlesListId, articlesLists } = state;
  if (!activeArticlesListId) {
    return;
  }
  articlesList.innerHTML = '';
  const list = articlesLists[activeArticlesListId];

  list.forEach(({ dom }) => {
    articlesList.append(dom);
  });
};

export const renderChannels = () => {
  const { channelsById, channels } = state;
  if (!channelsById.length) {
    return;
  }

  channelsById.forEach((id) => cards.append(channels[id]));
};

export const render = () => {
  renderChannels();
  renderArticlesList();
};
