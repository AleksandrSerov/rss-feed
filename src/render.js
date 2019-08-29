const render = (state) => {
  const { isFetching, card, articlesList } = state;

  const cards = document.querySelector('#cardsList');
  const articles = document.querySelector('#articlesList');
  const formButton = document.querySelector('#formButton');

  cards.innerHTML = '';
  cards.append(card);
  articles.innerHTML = '';
  articles.append(articlesList);

  if (isFetching) {
    formButton.disabled = true;
    formButton.innerHTML = 'Loading...';
  } else {
    formButton.innerHTML = 'Read';
    formButton.disabled = false;
  }
};

export default render;
