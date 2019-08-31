import isURL from 'validator/lib/isURL';
import axios from 'axios';
import { watch } from 'melanke-watchjs';
import { state, setState } from './state';
import build from './builder';
import parse from './parse';
import { render, renderArticlesList } from './renders';

const corsURL = 'https://cors-anywhere.herokuapp.com';

const form = document.getElementById('mainForm');
const input = document.getElementById('formInput');
const searchButton = document.getElementById('searchButton');

const typesStates = [
  {
    type: 'init',
    check: () => !state.processState,
  },
  {
    type: 'loading',
    check: () => state.isFetching,
  },
  {
    type: 'invalid',
    check: () => !state.isValidQuery || state.queryList.includes(state.query),
  },
  {
    type: 'valid',
    check: () => state.isValidQuery,
  },
  {
    type: 'error',
    check: () => state.isError,
  },
];

const getTypeState = () => typesStates.find(({ check }) => check()).type;

const formStates = {
  init: () => {
    setState({
      query: 'http://www.habrahabr.ru/rss/main/',
      isValidQuery: true,
    });
    searchButton.disabled = false;
    searchButton.innerHTML = 'Read';
  },
  loading: () => {
    searchButton.disabled = true;
    searchButton.innerHTML = 'Loading...';
  },
  invalid: () => {
    searchButton.disabled = true;
    searchButton.innerHTML = 'Invalid query';
    input.classList.add('border-danger');
  },
  valid: () => {
    searchButton.disabled = false;
    searchButton.innerHTML = 'Read';
    input.classList.remove('border-danger');
  },
  error: () => {
    searchButton.innerHTML = 'Error';
    searchButton.disabled = true;
  },
};

const handleInput = (value) => {
  setState({
    query: value,
    isValidQuery: isURL(value),
  });
};

const handleSubmit = () => {
  const { query, queryList } = state;
  setState({
    isFetching: true,
  });

  const url = `${corsURL}/${query}`;

  axios.get(url).then((response) => {
    const { data } = response;
    const parsed = parse(data);
    input.value = '';

    build(parsed);
    setState({
      isFetching: false,
      queryList: [...queryList, query],
      query: '',
      activeArticlesList: state.activeArticlesList.length
        ? state.activeArticlesList
        : state.articles[state.articlesById[0]],
    });
  });
};

const app = () => {
  watch(state, ['query', 'isValidQuery', 'isFetching'], () => {
    setState({
      processState: getTypeState(),
    });
  });

  watch(state, 'processState', () => {
    const { processState } = state;
    formStates[processState]();
    render();
  });

  watch(state, 'activeArticlesList', () => {
    renderArticlesList();
  });

  setState({ processState: 'init' });

  input.addEventListener('input', (e) => {
    handleInput(e.target.value);
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    handleSubmit();
  });
};

export default app;
