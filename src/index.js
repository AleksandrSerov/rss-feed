import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import isURL from 'validator/lib/isURL';
import axios from 'axios';
import parse from './parse';
import builder from './builder';

const corsURL = 'https://cors-anywhere.herokuapp.com';
let xml = null;

let state = {
  query: null,
  isValidQuery: false,
};

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

    if (isValidQuery) {
      const response = axios.get(`${corsURL}/${query}`);
      response.then((data) => {
        xml = data.data;
        const parsed = parse(xml);
        const { card, articlesList } = builder(parsed);
        const cards = document.querySelector('#cardsList');
        const articles = document.querySelector('#articlesList');
        cards.append(card);
        articles.append(articlesList);
      });
    }
  });
};

app();
