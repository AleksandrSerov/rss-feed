import $ from 'jquery';
import uuid from 'uuid/v1';
import { state, setState } from './state';

const htmlToElement = (html) => {
  const template = document.createElement('template');
  template.innerHTML = html.trim();
  return template.content.firstChild;
};

const getCard = (data, id) => {
  const title = data.querySelector('title').innerHTML;
  const text = data.querySelector('description').firstChild.data;
  const html = `
  <div>
    <a class="list-group-item list-group-item-action" href="#${id}">
      <div class="card-body">
        <h5 class="card-title">${title}</h5>
        <p class="card-text">${text}</p>
      </div>
    </a>
  </div>
  `;

  const dom = htmlToElement(html);
  const element = dom.querySelector('a');

  element.addEventListener('click', (e) => {
    e.preventDefault();
    setState({
      activeArticlesList: state.articles[element.hash.slice(1)],
    });
  });

  return dom;
};

const getArticleDescriptionModal = (data) => {
  const description = data.querySelector('description').firstChild.data;
  const modalId = uuid();
  const html = `
    <div class="modal" tabindex="-1" role="dialog" id="${modalId}">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Description</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <p>${description}</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    </div>
  `;

  const dom = htmlToElement(html);
  const modal = dom.querySelector('.modal');
  $(dom).click(() => {
    setState({
      activeArticleDescriptionId: modal,
    });
  });

  $(dom).on('hidde.bs.modal', () => {
    setState({
      activeArticleDescriptionId: null,
    });
  });
  return dom;
};

const getArticle = (data) => {
  const text = data.querySelector('title').firstChild.data;
  const href = data.querySelector('link').innerHTML;
  const articleId = uuid();
  const modal = getArticleDescriptionModal(data);
  const html = `
  <div>
    <a class="list-group-item list-group-item-action" href="${href}">${text}</a>
    <div>
      <a class="list-group-item list-group-item-action article-item" href="#${articleId}">Read</a>
    </div>
  </div>
  `;
  const dom = htmlToElement(html);
  const element = dom.querySelector('.article-item');
  element.addEventListener('click', (e) => {
    e.preventDefault();
    setState({
      activeArticleDescriptionId: modal,
    });
  });
  dom.append(modal);

  return dom;
};

const getArticlesList = (data) => {
  const articles = data.querySelectorAll('item');
  const html = `<div class="list-group"></div>`;
  const dom = htmlToElement(html);
  [...articles].forEach((article) => {
    dom.appendChild(getArticle(article));
  });

  return dom;
};

const build = (data) => {
  const { channels, articles, channelsById, articlesById } = state;
  const id = uuid();
  const card = getCard(data, id);
  const articlesList = getArticlesList(data);

  setState({
    channels: {
      ...channels,
      [id]: card,
    },
    channelsById: [...channelsById, id],
    articles: {
      ...articles,
      [id]: articlesList,
    },
    articlesById: [...articlesById, id],
  });
};

export default build;
