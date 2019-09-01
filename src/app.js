import isURL from 'validator/lib/isURL';
import axios from 'axios';
import { watch } from 'melanke-watchjs';
import { state, setState } from './state';
import { getArticlesList, build } from './builder';
import parse from './parse';
import { render, renderArticlesList } from './renders';

const corsURL = 'https://cors-anywhere.herokuapp.com';

const form = document.getElementById('mainForm');
const input = document.getElementById('formInput');
const searchButton = document.getElementById('searchButton');
const errorModal = document.getElementById('errorModal');

const stateTypes = [
  {
    type: 'init',
    check: () => !state.processState,
  },
  {
    type: 'error',
    check: () => state.isError,
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
];

const getTypeState = () => stateTypes.find(({ check }) => check()).type;

const formStates = {
  init: () => {
    setState({
      query: '',
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
    errorModal.classList.remove('d-none');
  },
};

const isValidInput = (value) => {
  const { queryList } = state;

  if (!isURL(value)) {
    return false;
  }
  if (queryList.includes(`${corsURL}/${value}`)) {
    return false;
  }

  return true;
};

const handleInput = (value) => {
  setState({
    query: value,
    isValidQuery: isValidInput(value),
  });
};

const handleSubmit = () => {
  const { query, queryList } = state;
  setState({
    isFetching: true,
  });

  const url = `${corsURL}/${query}`;

  axios
    .get(url)
    .then(({ data }) => {
      const parsed = parse(data);
      input.value = '';

      build(parsed);
      setState({
        isFetching: false,
        queryList: [...queryList, url],
        query: '',
        activeArticlesListId: state.activeArticlesListId
          ? state.activeArticlesListId
          : state.articlesListsById[0],
      });
    })
    .catch(() => {
      setState({
        isError: true,
      });
    });
};

const checkForUpdates = () => {
  setInterval(() => {
    const { queryList, articlesListsById, articlesLists } = state;
    const promises = queryList.map(axios.get);
    Promise.all(promises)
      .then((arr) => {
        arr
          .map(({ data }) => data)
          .map(parse)
          .forEach((data, index) => {
            const articlesList = getArticlesList(data);
            const id = articlesListsById[index];
            const stateArticlesList = articlesLists[id];
            const newArticles = articlesList.filter(
              ({ uid }, idx) => uid !== stateArticlesList[idx].uid,
            );
            setState({
              articlesLists: {
                ...articlesLists,
                [id]: [...articlesLists[id], ...newArticles],
              },
            });
          });
      })
      .catch(() => {
        setState({
          isError: true,
        });
      });
  }, 5000);
};

const app = () => {
  watch(state, ['query', 'isValidQuery', 'isFetching', 'isError'], () => {
    setState({
      processState: getTypeState(),
    });
  });

  watch(state, 'processState', () => {
    const { processState } = state;
    formStates[processState]();
    render();
  });

  watch(state, 'activeArticlesListId', () => {
    renderArticlesList();
  });

  watch(state, 'articlesLists', () => {
    renderArticlesList();
  });

  checkForUpdates();

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
