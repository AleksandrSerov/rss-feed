import { state } from './state';

const cards = document.getElementById('cardsList');
const articlesListsList = document.getElementById('articlesListsLists');
export const renderArticlesList = () => {
  const { activeArticlesList } = state;
  articlesListsList.innerHTML = '';
  articlesListsList.append(activeArticlesList);
};

export const renderChannels = () => {
  const { channelsById, channels } = state;
  channelsById.forEach((id) => cards.append(channels[id]));
};

export const render = () => {
  renderChannels();
  renderArticlesList();
};
