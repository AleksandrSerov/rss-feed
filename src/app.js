import isURL from 'validator/lib/isURL';
import axios from 'axios';
import _ from 'lodash';
import { watch } from 'melanke-watchjs';
import parse from './parser';
import render from './renders';

const corsURL = 'https://cors-anywhere.herokuapp.com';
const checkUpdateInterval = 5000;

const form = document.getElementById('mainForm');
const input = document.getElementById('formInput');
const searchButton = document.getElementById('searchButton');
const errorModal = document.getElementById('errorModal');
const closeErrorButton = document.getElementById('closeErrorButton');

const exampleLinks = document.querySelectorAll('.exampleLink');
const app = () => {
  const state = {
    processState: null,
    queryList: [],
    feed: [],
  };

  const formStates = {
    init: () => {
      input.value = '';
      input.disabled = false;
      searchButton.disabled = false;
      searchButton.innerHTML = 'Read';
    },
    loading: () => {
      searchButton.disabled = true;
      input.disabled = true;
      searchButton.innerHTML = 'Loading...';
    },
    invalid: () => {
      searchButton.disabled = true;
      searchButton.innerHTML = 'Invalid query';
      input.classList.add('border-danger');
    },
    valid: () => {
      input.classList.remove('border-danger');
      searchButton.disabled = false;
      searchButton.innerHTML = 'Read';
    },
    error: () => {
      errorModal.classList.remove('d-none');
      state.processState = 'init';
    },
  };

  const validateInut = (value) => {
    const { queryList } = state;

    if (!isURL(value) || queryList.includes(`${corsURL}/${value}`)) {
      state.processState = 'invalid';
      return;
    }

    state.processState = 'valid';
  };

  exampleLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();

      const value = e.target.href;
      if (state.processState === 'loading') {
        return;
      }
      input.value = value;
      validateInut(value);
    });
  });

  const handleInput = (value) => {
    validateInut(value);
  };

  const handleCloseErrorModal = () => {
    errorModal.classList.add('d-none');
  };

  const handleSubmit = () => {
    const { value } = input;

    state.processState = 'loading';

    const url = `${corsURL}/${value}`;

    axios
      .get(url)
      .then(({ data }) => {
        const parsed = parse(data);
        state.feed = [...state.feed, parsed];
        state.queryList = [...state.queryList, url];
        state.processState = 'init';
      })
      .catch(() => {
        state.processState = 'error';
      });
  };

  const checkForUpdates = () => {
    setTimeout(() => {
      const { queryList, feed } = state;
      const promises = queryList.map(axios.get);
      Promise.all(promises)
        .then((arr) => arr.map(({ data }) => parse(data)))
        .then((parsed) => {
          parsed.forEach(({ items }, index) => {
            const currentFeed = feed[index];
            currentFeed.items = _.unionBy(currentFeed.items, items, 'uid');
          });
        })
        .catch(() => {
          state.processState = 'error';
        })
        .finally(checkForUpdates);
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

  closeErrorButton.addEventListener('click', () => {
    handleCloseErrorModal();
  });
};

export default app;
