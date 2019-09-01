import $ from 'jquery';
import uuid from 'uuid/v1';
import { state, setState } from './state';

const htmlToElement = (html) => {
  const template = document.createElement('template');
  template.innerHTML = html.trim();
  return template.content.firstChild;
};

const getChannel = (data, id) => {
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
      activeArticlesList: state.articles[id],
    });
  });

  return dom;
};

const getModal = (data) => {
  const description = data.querySelector('description').firstChild.data;
  const html = `
    <div class="modal" tabindex="-1" role="dialog">
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

  return dom;
};

const getArticle = (data) => {
  const text = data.querySelector('title').firstChild.data;
  const href = data.querySelector('link').innerHTML;
  const articleId = uuid();
  const modal = getModal(data);
  const html = `
  <div class="card">
    <div class="card-body">
      <h5 class="card-title">
        <a class="card-link" href="${href}">${text}</a><br/>
      </h5>
      <button id="${articleId}" class="btn btn-primary">Read description</button>
    </div>
  </div>
  `;

  const dom = htmlToElement(html);

  const button = dom.querySelector(`#${articleId}`);
  $(button).click(() => {
    $(modal).modal('toggle');
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
  const channel = getChannel(data, id);
  const articlesList = getArticlesList(data);

  setState({
    channels: {
      ...channels,
      [id]: channel,
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
