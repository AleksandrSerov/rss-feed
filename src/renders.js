const channelsList = document.getElementById('channelsList');
const articlesList = document.getElementById('articlesList');

const htmlToElement = (html) => {
  const template = document.createElement('template');
  template.innerHTML = html.trim();
  return template.content.firstChild;
};

// export const renderArticlesList = () => {
//   const { activeArticlesListId, articlesLists } = state;
//   if (!activeArticlesListId) {
//     return;
//   }
//   articlesList.innerHTML = '';
//   const list = articlesLists[activeArticlesListId];

//   list.forEach(({ dom }) => {
//     articlesList.append(dom);
//   });
// };

// export const renderChannels = () => {
//   const { channelsById, channels } = state;
//   if (!channelsById.length) {
//     return;
//   }

//   channelsById.forEach((id) => cards.append(channels[id]));
// };

// export const render = () => {
//   renderChannels();
//   renderArticlesList();
// };

export const getChannel = (feed) => {
  const { title, text, id } = feed;
  const isEmptyList = !channelsList.innerHTML.length;
  const html = `
    <a class="list-group-item list-group-item-action ${
      isEmptyList ? 'active' : ''
    }" data-toggle="list" href="#${id}" role="tab">
      <div class="card-body">
        <h5 class="card-title">${title}</h5>
        <p class="card-text">${text}</p>
      </div>
    </a>
  `;

  const dom = htmlToElement(html);

  return dom;
};

export const getArticle = (item) => {
  const { title, link, uid } = item;
  const html = `
  <div class="card">
    <div class="card-body">
      <h5 class="card-title">
        <a class="card-link" href="${link}">${title}</a><br/>
      </h5>
      <button  class="btn btn-primary">Read description</button>
    </div>
  </div>
  `;

  const dom = htmlToElement(html);
  // const button = dom.querySelector(`#${id}`);
  // $(button).click(() => {
  //   $(modal).modal('toggle');
  // });
  // dom.append(modal);

  return dom;
};

export const getArticlesList = (feed) => {
  const { items, id } = feed;
  const isEmptyList = !articlesList.innerHTML.length;
  console.log(isEmptyList);
  const html = `
  <div class="tab-pane fade ${
    isEmptyList ? 'show active' : ''
  }" id="${id}" role="tabpanel">
  </div>
  `;

  const dom = htmlToElement(html);

  items.map(getArticle).forEach((item) => dom.append(item));

  return dom;
};

export const renderFeed = (feed) => {
  const channel = getChannel(feed);
  channelsList.appendChild(channel);

  const list = getArticlesList(feed);
  articlesList.appendChild(list);
};
