import isURL from 'validator/lib/isURL';
import axios from 'axios';
import _ from 'lodash';
import { watch } from 'melanke-watchjs';
import parse from './parser';
import render from './renders';

const app = (doc) => {
  const corsURL = 'https://cors-anywhere.herokuapp.com';
  const checkUpdateInterval = 5000;
  const errorNoResponseTime = 5000;

  const state = {
    layout: {
      formId: 'mainForm',
      inputId: 'formInput',
      searchButtonId: 'searchButton',
      errorModalId: 'errorModal',
      closeErrorButtonId: 'closeErrorButton',
      exampleLinkClass: 'exampleLink',
    },
    articlesListId: 'articlesList',
    channelsListId: 'channelsList',
    modalsListId: 'modalsList',
    processState: 'init',
    query: '',
    queryList: [],
    feed: [],
    error: {
      processState: 'hide',
    },
  };

  const {
    formId,
    inputId,
    searchButtonId,
    errorModalId,
    closeErrorButtonId,
    exampleLinkClass,
  } = state.layout;

  const form = doc.getElementById(formId);
  const input = doc.getElementById(inputId);
  const searchButton = doc.getElementById(searchButtonId);
  const errorModal = doc.getElementById(errorModalId);
  const closeErrorButton = doc.getElementById(closeErrorButtonId);
  const exampleLinks = doc.getElementsByClassName(exampleLinkClass);

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
      input.disabled = false;
      searchButton.disabled = false;
      searchButton.innerHTML = 'Read';
      state.error.processState = 'show';
    },
    errorNoResponse: () => {
      input.disabled = false;
      searchButton.disabled = false;
      searchButton.innerHTML = 'Read';
      state.error.processState = 'show';
    },
    errorNoResponseUpdate: () => {
      state.error.processState = 'show';
    },
  };

  const errorModalStates = {
    show: () => {
      errorModal.classList.remove('d-none');
    },
    hide: () => {
      errorModal.classList.add('d-none');
    },
  };

  const validateInut = () => {
    const { query, queryList } = state;

    if (
      query.length &&
      (!isURL(query) || queryList.includes(`${corsURL}/${query}`))
    ) {
      state.processState = 'invalid';
      return;
    }

    state.processState = 'valid';
  };

  [...exampleLinks].forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();

      const value = e.target.href;
      if (state.processState === 'loading') {
        return;
      }
      input.value = value;
      state.query = value;
    });
  });

  const handleInput = (value) => {
    state.query = value;
  };

  const handleCloseErrorModal = () => {
    const { error } = state;

    error.processState = 'hide';
  };

  const handleSubmit = () => {
    const { query } = state;

    state.processState = 'loading';

    const url = `${corsURL}/${query}`;

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
            .forEach(({ articles }, index) => {
              const currentFeed = feed[index];
              currentFeed.articles = _.unionBy(
                currentFeed.articles,
                articles,
                'uid',
              );
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

  watch(state, 'error', () => {
    const { processState } = state.error;
    errorModalStates[processState]();
  });

  watch(state, 'query', () => {
    validateInut();
  });

  checkForUpdates();

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
