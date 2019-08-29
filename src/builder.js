const cardTemplate = () => {
  const card = document.createElement('div');
  card.classList.add('card', 'mb-1');
  card.style.width = '18rem';
  const cardBody = document.createElement('div');
  cardBody.classList.add('card-body');
  const cardTitle = document.createElement('h5');
  cardTitle.innerHTML = 'Default';
  cardTitle.classList.add('card-title');
  const cardText = document.createElement('p');
  cardText.classList.add('card-text');
  cardText.innerHTML = 'Lorem ipsum, dolor sit amet consectetur elit.';
  const cardButton = document.createElement('a');
  cardButton.classList.add('btn', 'btn-primary');
  cardButton.href = '#';
  cardButton.innerHTML = 'Read';

  cardBody.append(cardTitle, cardText, cardButton);
  card.append(cardBody);

  return card;
};

const articleTemplate = () => {
  const article = document.createElement('a');
  article.href = '#';
  article.classList.add('list-group-item', 'list-group-item-action');
  article.innerHTML = 'Default';

  return article;
};

const buildCard = (data) => {
  const title = data.querySelector('title');
  const description = data.querySelector('description');
  const card = cardTemplate();
  const cardTitle = card.querySelector('.card-title');
  const cardText = card.querySelector('.card-text');
  cardTitle.innerHTML = title.innerHTML;
  cardText.innerHTML = description.innerHTML;
  return card;
};

const buildArticlesList = (data) => {
  const articles = data.querySelectorAll('item');
  const list = document.createElement('div');
  list.classList.add('list-group');
  articles.forEach((article) => {
    const resultArticle = articleTemplate();
    resultArticle.innerHTML = article.querySelector('title').firstChild.data;
    resultArticle.href = article.querySelector('link').innerHTML;
    list.append(resultArticle);
  });
  return list;
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
