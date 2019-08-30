import { state, setState } from './state';

const htmlToElement = (html) => {
  const template = document.createElement('template');
  template.innerHTML = html.trim();
  return template.content.firstChild;
};

const getCard = (data) => {
  const title = data.querySelector('title').innerHTML;
  const text = data.querySelector('description').firstChild.data;
  const href = data.querySelector('link').innerHTML;
  const html = `
  <div class="card mb-1" style="width: 18rem;">
    <div class="card-body">
      <h5 class="card-title">${title}</h5>
      <p class="card-text">${text}</p>
      <a class="btn btn-primary" href="${href}">Read</a>
    </div>
  </div>
  `;

  return htmlToElement(html);
};

const getArticleHTML = (data) => {
  const text = data.querySelector('title').firstChild.data;
  const href = data.querySelector('link').innerHTML;
  const html = `
  <a class="list-group-item list-group-item-action" href="${href}">${text}</a>
  `;

  return html;
};

const getArticlesList = (data) => {
  const articles = data.querySelectorAll('item');
  const html = `
  <div class="list-group">
    ${[...articles].map(getArticleHTML).join('')}
  </div>
  `;

  return htmlToElement(html);
};

const builder = (data) => {
  const card = getCard(data);
  const articlesList = getArticlesList(data);
  setState({
    channels: [...state.channels, card],
    articles: [...state.articles, articlesList],
  });
  return {
    card,
    articlesList,
  };
};

export default builder;
