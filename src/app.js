import isURL from 'validator/lib/isURL';
import axios from 'axios';
import { watch } from 'melanke-watchjs';
import parse from './parse';
import render from './renders';

const corsURL = 'https://cors-anywhere.herokuapp.com';
const checkUpdateInterval = 5000;

const form = document.getElementById('mainForm');
const input = document.getElementById('formInput');
const searchButton = document.getElementById('searchButton');
const errorModal = document.getElementById('errorModal');
const app = () => {
  const state = {
    processState: null,
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
      input.disabled = false;
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
      input.disabled = true;

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

  const checkForUpdates = () => {
    setInterval(() => {
      const { queryList, feed } = state;
      const promises = queryList.map(axios.get);
      Promise.all(promises)
        .then((arr) => arr.map(({ data }) => parse(data)))
        .then((parsed) => {
          parsed.forEach(({ items }, index) => {
            const currentFeed = feed[index];
            const { items: currentItems } = currentFeed;
            const newArticles = items.filter(
              ({ uid }, idx) => uid !== currentItems[idx].uid,
            );
            if (!newArticles.length) {
              return;
            }

            currentFeed.items = [...currentFeed.items, ...newArticles];
          });
        });
    }, checkUpdateInterval);
  };

  watch(state, 'feed', () => {
    const { feed } = state;

    render(feed);
  });

  watch(state, 'processState', () => {
    const { processState } = state;

    formStates[processState]();
  });

  checkForUpdates();
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
