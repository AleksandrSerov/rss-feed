const htmlToElement = (html) => {
  const template = document.createElement('template');
  template.innerHTML = html.trim();
  return template.content.firstChild;
};

const getCardHTML = (props) => {
  const { title, text, href = '#' } = props;
  const html = `
  <div class="card mb-1" style="width: 18rem;">
    <div class="card-body">
      <h5 class="card-title">${title}</h5>
      <p class="card-text">${text}</p>
      <a class="btn btn-primary" href="${href}">Read</a>
    </div>
  </div>
  `;

  return html;
};

const buildCard = (data) => {
  const title = data.querySelector('title').innerHTML;
  const text = data.querySelector('description').firstChild.data;
  const html = getCardHTML({ title, text });
  return htmlToElement(html);
};

const getArticleHTML = (props) => {
  const { href, text } = props;
  const html = `
  <a class="list-group-item list-group-item-action" href="${href}">${text}</a>
  `;

  return html;
};

const getArticlesListHTML = (articles) => {
  const html = `
  <div class="list-group">
    ${[...articles]
      .map((article) => {
        const text = article.querySelector('title').firstChild.data;
        const href = article.querySelector('link').innerHTML;

        return getArticleHTML({ href, text });
      })
      .join('')}
  </div>
  `;

  return html;
};

const buildArticlesList = (data) => {
  const articles = data.querySelectorAll('item');
  const html = getArticlesListHTML(articles);

  return htmlToElement(html);
};

const builder = (data) => {
  const card = buildCard(data);
  const articlesList = buildArticlesList(data);
  return {
    card,
    articlesList,
  };
};

export default builder;
