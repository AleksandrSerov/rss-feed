import isURL from 'validator/lib/isURL';
import axios from 'axios';
import { watch } from 'melanke-watchjs';
import { state, setState } from './state';
import builder from './builder';
import parse from './parse';
import render from './renders';

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
    render();
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

const app = () => {
  watch(state, 'processState', () => {
    const { processState } = state;
    formStates[processState]();
  });

  watch(state, () => {
    setState({
      processState: getTypeState(),
    });
  });

  setState({ processState: 'init' });

  input.addEventListener('input', (e) => {
    const { value } = e.target;

    setState({
      query: value,
      isValidQuery: isURL(value),
    });
    if (!state.isValidQuery) {
      state.processState = 'invalid';
    }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    setState({
      isFetching: true,
    });

    const { query } = state;

    axios.get(`${corsURL}/${query}`).then((response) => {
      const { data } = response;
      setState({
        isFetching: false,
        queryList: [...state.queryList, query],
      });
      const parsed = parse(data);

      builder(parsed);
      render();
    });
  });
};

export default app;
