import { state } from './state';

const cards = document.getElementById('cardsList');
const articlesList = document.getElementById('articlesLists');
export const renderArticlesList = () => {
  const { activeArticlesList } = state;
  articlesList.innerHTML = '';
  articlesList.append(activeArticlesList);
};

export const renderChannels = () => {
  const { channelsById, channels } = state;
  channelsById.forEach((id) => cards.append(channels[id]));
};

export const render = () => {
  renderChannels();
  renderArticlesList();
};
