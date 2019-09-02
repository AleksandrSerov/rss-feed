import isURL from 'validator/lib/isURL';
import axios from 'axios';
import { watch } from 'melanke-watchjs';
import parse from './parse';
import { renderFeed } from './renders';

const corsURL = 'https://cors-anywhere.herokuapp.com';

const form = document.getElementById('mainForm');
const input = document.getElementById('formInput');
const searchButton = document.getElementById('searchButton');
const errorModal = document.getElementById('errorModal');

const app = () => {
  const state = {
    processState: 'init',
    query: '',
    queryList: [],
    isValidQuery: true,
    isFetching: false,
    isError: false,
    channels: {},
    channelsById: [],
    articlesLists: {},
    articlesListsById: [],
    activeArticlesListId: null,
    feed: [],
  };

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
      state.query = '';
      state.isValidQuery = true;
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
    state.query = value;
    state.isValidQuery = isValidInput(value);
  };

  const handleSubmit = () => {
    const { query } = state;
    state.isFetching = true;

    const url = `${corsURL}/${query}`;

    axios
      .get(url)
      .then(({ data }) => {
        const parsed = parse(data);
        console.log(parsed);
        input.value = '';
        state.feed = [...state.feed, parsed];
        state.isFetching = false;
        state.queryList = [...state.queryList, url];
        state.query = '';
      })
      .catch(() => {
        state.isError = true;
      });
  };

  // const checkForUpdates = () => {
  //   setInterval(() => {
  //     const { queryList, articlesListsById, articlesLists } = state;
  //     const promises = queryList.map(axios.get);
  //     Promise.all(promises)
  //       .then((arr) => {
  //         arr
  //           .map(({ data }) => data)
  //           .map(parse)
  //           .forEach((data, index) => {
  //             const articlesList = getArticlesList(data);
  //             const id = articlesListsById[index];
  //             const stateArticlesList = articlesLists[id];
  //             const newArticles = articlesList.filter(
  //               ({ uid }, idx) => uid !== stateArticlesList[idx].uid,
  //             );
  //             setState({
  //               articlesLists: {
  //                 ...articlesLists,
  //                 [id]: [...articlesLists[id], ...newArticles],
  //               },
  //             });
  //           });
  //       })
  //       .catch(() => {
  //         setState({
  //           isError: true,
  //         });
  //       });
  //   }, 5000);
  // };
  watch(state, 'feed', () => {
    const feed = state.feed[state.feed.length - 1];
    renderFeed(feed, state.activeFeedId);
  });

  watch(state, ['query', 'isValidQuery', 'isFetching', 'isError'], () => {
    state.processState = getTypeState();
  });

  watch(state, 'processState', () => {
    const { processState } = state;
    formStates[processState]();
    // render();
  });

  watch(state, ['activeArticlesListId', 'articlesLists'], () => {
    // renderArticlesList();
  });

  // checkForUpdates();
  state.processState = 'init';

  input.addEventListener('input', (e) => {
    handleInput(e.target.value);
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    handleSubmit();
  });
};

export default app;
