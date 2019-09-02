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
    feed: [],
  };

  const formStates = {
    init: () => {
      state.query = '';
      input.value = '';
      state.isValidQuery = true;
      searchButton.disabled = false;
      searchButton.innerHTML = 'Read';
      errorModal.classList.add('d-none');
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
      setTimeout(() => {
        state.processState = 'init';
      }, 2500);
    },
  };

  const isValidInput = (value) => {
    const { queryList } = state;

    if (value.length && !isURL(value)) {
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
    if (!query.length) {
      state.processState = 'error';
      return;
    }

    state.processState = 'loading';

    const url = `${corsURL}/${query}`;

    axios
      .get(url)
      .then(({ data }) => {
        const parsed = parse(data);
        state.processState = 'init';
        state.feed = [...state.feed, parsed];
        state.queryList = [...state.queryList, url];
      })
      .catch(() => {
        state.processState = 'error';
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

  watch(state, 'processState', () => {
    const { processState } = state;
    formStates[processState]();
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
