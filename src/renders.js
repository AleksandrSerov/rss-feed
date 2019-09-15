const htmlToElement = (html) => {
  const template = document.createElement('template');
  template.innerHTML = html.trim();
  return template.content.firstChild;
};

const getChannel = (feedItem) => {
  const { title, text, channelId } = feedItem;

  const html = `
    <a class="list-group-item list-group-item-action" data-toggle="list" href="#list-${channelId}" id="${channelId}" role="tab">
      <div class="card-body">
        <h5 class="card-title">${title}</h5>
        <p class="card-text">${text}</p>
      </div>
    </a>
  `;

  const dom = htmlToElement(html);

  return dom;
};

const getModal = (description, articleId) => {
  const html = `
  <div class="modal fade" id="${articleId}" tabindex="-1" role="dialog" aria-labelledby="example" aria-hidden="true">
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

const getArticle = (item, modalsListId) => {
  const { title, link, articleId, description } = item;

  const html = `
  <div class="card">
    <div class="card-body">
      <h5 class="card-title">
        <a class="card-link" href="${link}">${title}</a><br/>
      </h5>
      <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#${articleId}">
        Read description
      </button>
    </div>
  </div>
  `;

  const modal = getModal(description, articleId);

  const modalsList = document.getElementById(modalsListId);
  const isModalExist = modalsList.querySelector(`#${articleId}`);

  if (!isModalExist) {
    modalsList.appendChild(modal);
  }

  const dom = htmlToElement(html);

  return dom;
};

const getArticlesList = (feedItem, modalsListId, articlesListId) => {
  const { articles, channelId } = feedItem;
  const articlesList = document.getElementById(articlesListId);

  const isEmptyList = !articlesList.innerHTML.length;
  const html = `
  <div class="tab-pane fade ${
    isEmptyList ? 'show active' : ''
  }" id="list-${channelId}" role="tabpanel">
  </div>
  `;

  const dom = htmlToElement(html);
  articles.forEach((article) => dom.append(getArticle(article, modalsListId)));
  return dom;
};

const renderChannel = (feedItem, channelsListId) => {
  const { channelId } = feedItem;
  const channelsList = document.getElementById(channelsListId);

  const isChannelExist = channelsList.querySelector(`#${channelId}`);
  if (isChannelExist) {
    return;
  }

  const isEmptyList = !channelsList.innerHTML.length;
  const channel = getChannel(feedItem);
  if (isEmptyList) {
    channel.classList.add('active');
  }

  channelsList.appendChild(channel);
};

const renderArticlesList = (feedItem, modalsListId, articlesListId) => {
  const { channelId, articles } = feedItem;
  const articlesList = document.getElementById(articlesListId);

  const articleList = articlesList.querySelector(`#list-${channelId}`);
  if (!articleList) {
    const list = getArticlesList(feedItem, modalsListId, articlesListId);
    articlesList.appendChild(list);
    return;
  }

  articleList.innerHTML = '';
  articles
    .map((articleItem) => getArticle(articleItem, modalsListId))
    .forEach((article) => articleList.append(article));
};

export default (state) => {
  const { feed, modalsListId, articlesListId, channelsListId } = state;

  feed.forEach((feedItem) => {
    renderChannel(feedItem, channelsListId);
    renderArticlesList(feedItem, modalsListId, articlesListId);
  });
};
