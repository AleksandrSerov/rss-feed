import { state } from './state';

const cards = document.getElementById('cardsList');
const articlesList = document.getElementById('articlesList');

export default () => {
  const { channels, articles } = state;
  channels.forEach((channel) => {
    cards.append(channel);
  });
  articles.forEach((article) => {
    articlesList.append(article);
  });
};
