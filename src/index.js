import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import isURL from 'validator/lib/isURL';
import axios from 'axios';
import parse from './parse';
import builder from './builder';

const corsURL = 'https://cors-anywhere.herokuapp.com';

let state = {
  query: null,
  isValidQuery: false,
};

const cards = document.querySelector('#cardsList');
const articles = document.querySelector('#articlesList');

const validateSearchInput = (input) => {
  const { isValidQuery } = state;

  if (isValidQuery) {
    input.classList.remove('border-danger');
    return;
  }

  input.classList.add('border-danger');
};

const setState = (params) => {
  state = {
    ...state,
    ...params,
  };
};

const app = () => {
  setState({
    query: 'http://www.habrahabr.ru/rss/main/',
    isValidQuery: true,
  });

  const input = document.getElementById('formInput');
  input.addEventListener('input', (e) => {
    setState({
      query: e.target.value,
      isValidQuery: isURL(e.target.value),
    });

    validateSearchInput(input);
  });

  const form = document.getElementById('mainForm');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const { query, isValidQuery } = state;
    if (!isValidQuery) {
      console.error('Query not valid!');
      return;
    }

    axios.get(`${corsURL}/${query}`).then(({ data }) => {
      const parsed = parse(data);

      const { card, articlesList } = builder(parsed);
      cards.innerHTML = '';
      cards.append(card);
      articles.innerHTML = '';
      articles.append(articlesList);
    });
  });
};

app();
