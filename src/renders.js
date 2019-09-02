const channelsList = document.getElementById('channelsList');
const articlesList = document.getElementById('articlesList');
const modalList = document.getElementById('modal');

const htmlToElement = (html) => {
  const template = document.createElement('template');
  template.innerHTML = html.trim();
  return template.content.firstChild;
};

export const getChannel = (feed) => {
  const { title, text, id } = feed;
  const isEmptyList = !channelsList.innerHTML.length;
  const html = `
    <a class="list-group-item list-group-item-action ${
      isEmptyList ? 'active' : ''
    }" data-toggle="list" href="#list-${id}" id="${id}" role="tab">
      <div class="card-body">
        <h5 class="card-title">${title}</h5>
        <p class="card-text">${text}</p>
      </div>
    </a>
  `;

  const dom = htmlToElement(html);

  return dom;
};

export const getModal = (description, id) => {
  const html = `
  <div class="modal fade" id="${id}" tabindex="-1" role="dialog" aria-labelledby="example" aria-hidden="true">
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

export const getArticle = (item) => {
  const { title, link, id, description } = item;
  const html = `
  <div class="card">
    <div class="card-body">
      <h5 class="card-title">
        <a class="card-link" href="${link}">${title}</a><br/>
      </h5>
      <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#${id}">
        Read description
      </button>
    </div>
  </div>
  `;

  if (!modalList.querySelector(`#${id}`)) {
    const modal = getModal(description, id);
    modalList.appendChild(modal);
  }

  const dom = htmlToElement(html);

  return dom;
};

export const getArticlesList = (feed) => {
  const { items, id } = feed;
  const isEmptyList = !articlesList.innerHTML.length;
  const html = `
  <div class="tab-pane fade ${
    isEmptyList ? 'show active' : ''
  }" id="list-${id}" role="tabpanel">
  </div>
  `;

  const dom = htmlToElement(html);

  items.map(getArticle).forEach((item) => dom.append(item));
  return dom;
};

const renderChannel = (item) => {
  const { id } = item;
  const channelList = channelsList.querySelector(`#${id}`);
  if (!channelList) {
    const channel = getChannel(item);
    channelsList.appendChild(channel);
  }
};

const renderList = (item) => {
  const { id, items } = item;
  const articleList = articlesList.querySelector(`#list-${id}`);
  if (!articleList) {
    const list = getArticlesList(item);
    articlesList.appendChild(list);
  }

  articleList.innerHTML = '';
  items.map(getArticle).forEach((article) => articleList.append(article));
};

export const renderFeed = (feed) => {
  feed.forEach((item) => {
    renderChannel(item);
    renderList(item);
  });
};
