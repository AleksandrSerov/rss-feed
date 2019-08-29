import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import isURL from 'validator/lib/isURL';
import axios from 'axios';
import { watch } from 'melanke-watchjs';
import parse from './parse';
import builder from './builder';
import state from './state';
import render from './render';

const corsURL = 'https://cors-anywhere.herokuapp.com';

const validateSearchInput = (input) => {
  const { isValidQuery } = state;

  if (isValidQuery) {
    input.classList.remove('border-danger');
    return;
  }

  input.classList.add('border-danger');
};

const setState = (props) => {
  Object.keys(props).forEach((key) => {
    state[key] = props[key];
  });
};

const setInitialState = () => {
  setState({
    query: 'http://www.habrahabr.ru/rss/main/',
    isValidQuery: true,
  });
};

const app = () => {
  setInitialState();
  watch(state, 'isFetching', () => {
    console.log(state.isFetching);
    render(state);
  });

  const input = document.getElementById('formInput');
  input.addEventListener('input', (e) => {
    setState({
      query: e.target.value,
      isValidQuery: isURL(e.target.value),
    });
    console.log(state);
    validateSearchInput(input);
  });

  const form = document.getElementById('mainForm');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    setState({
      isFetching: true,
    });
    const { query, isValidQuery } = state;
    if (!isValidQuery) {
      console.error('Query not valid!');
      return;
    }

    axios.get(`${corsURL}/${query}`).then(({ data }) => {
      const { card, articlesList } = builder(parse(data));
      setState({
        isFetching: false,
        articlesList,
        card,
      });
    });
  });
};

app();
