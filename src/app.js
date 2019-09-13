import isURL from 'validator/lib/isURL';
import axios from 'axios';
import _ from 'lodash';
import { watch } from 'melanke-watchjs';
import parse from './parser';
import render from './renders';

const corsURL = 'https://cors-anywhere.herokuapp.com';
const checkUpdateInterval = 5000;
const errorNoResponseTime = 5000;

const input = document.getElementById('formInput');
const searchButton = document.getElementById('searchButton');
const errorModal = document.getElementById('errorModal');
const closeErrorButton = document.getElementById('closeErrorButton');
const exampleLinks = document.querySelectorAll('.exampleLink');

const app = () => {
  const state = {
    layout: {
      formId: 'mainForm',
    },
    articlesListId: 'articlesList',
    channelsListId: 'channelsList',
    modalsListId: 'modalsList',
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
    errorNoResponse: () => {
      input.value = '';
      input.disabled = false;
      searchButton.disabled = false;
      searchButton.innerHTML = 'Read';
      errorModal.classList.remove('d-none');
    },
    errorNoResponseUpdate: () => {
      errorModal.classList.remove('d-none');
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

    const errorNoResponseTimerId = setTimeout(() => {
      state.processState = 'errorNoResponse';
    }, errorNoResponseTime);

    axios
      .get(url)
      .then(({ data }) => {
        if (state.processState === 'errorNoResponse') {
          return;
        }
        clearTimeout(errorNoResponseTimerId);
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
    const checkUpdateTimerId = setTimeout(() => {
      const { queryList, feed } = state;

      if (!queryList.length) {
        clearTimeout(checkUpdateTimerId);
        checkForUpdates();
        return;
      }

      const errNoResponseUpdateTimerId = setTimeout(() => {
        state.processState = 'errorNoResponseUpdate';
      }, errorNoResponseTime);

      const promises = queryList.map(axios.get);
      Promise.all(promises)
        .then((arr) => {
          if (state.processState === 'errorNoResponseUpdate') {
            checkForUpdates();
            return;
          }
          clearTimeout(errNoResponseUpdateTimerId);

          arr
            .map(({ data }) => data)
            .map(parse)
            .forEach(({ items }, index) => {
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
    render(state);
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

  const form = document.getElementById(state.layout.formId);
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    handleSubmit();
  });

  closeErrorButton.addEventListener('click', () => {
    handleCloseErrorModal();
  });
};

export default app;
