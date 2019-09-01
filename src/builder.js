import $ from 'jquery';
import uniqid from 'uniqid';
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
      activeArticlesList: state.articlesLists[id],
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
  const id = uniqid();
  const modal = getModal(data);
  const html = `
  <div class="card">
    <div class="card-body">
      <h5 class="card-title">
        <a class="card-link" href="${href}">${text}</a><br/>
      </h5>
      <button id="${id}" class="btn btn-primary">Read description</button>
    </div>
  </div>
  `;

  const dom = htmlToElement(html);
  const button = dom.querySelector(`#${id}`);
  $(button).click(() => {
    $(modal).modal('toggle');
  });
  dom.append(modal);

  return dom;
};

const getArticlesList = (data) => {
  const articlesLists = data.querySelectorAll('item');
  const html = `<div class="list-group"></div>`;
  const dom = htmlToElement(html);
  [...articlesLists].forEach((article) => {
    dom.appendChild(getArticle(article));
  });

  return dom;
};

const build = (data) => {
  const { channels, articlesLists, channelsById, articlesListsById } = state;
  const id = uniqid();
  const channel = getChannel(data, id);
  const list = getArticlesList(data);

  setState({
    channels: {
      ...channels,
      [id]: channel,
    },
    channelsById: [...channelsById, id],
    articlesLists: {
      ...articlesLists,
      [id]: list,
    },
    articlesListsById: [...articlesListsById, id],
  });
  console.log(state);
};

export default build;
