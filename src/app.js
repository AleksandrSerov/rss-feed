import isURL from 'validator/lib/isURL';
import axios from 'axios';
import _ from 'lodash';
import { watch } from 'melanke-watchjs';
import parse from './parser';
import render from './renders';

export default (doc) => {
  const corsURL = 'https://cors-anywhere.herokuapp.com';
  const checkUpdateInterval = 5000;
  const errorNoResponseTime = 5000;

  const layout = {
    formId: 'mainForm',
    inputId: 'formInput',
    searchButtonId: 'searchButton',
    errorModalId: 'errorModal',
    closeErrorButtonId: 'closeErrorButton',
    articlesListId: 'articlesList',
    channelsListId: 'channelsList',
    modalsListId: 'modalsList',
    exampleLinkClass: 'exampleLink',
  };

  const state = {
    formState: 'init',
    query: '',
    queryList: [],
    feed: [],
    error: {
      errorState: 'hide',
    },
  };

  const {
    formId,
    inputId,
    searchButtonId,
    errorModalId,
    closeErrorButtonId,
    exampleLinkClass,
  } = layout;

  const form = doc.getElementById(formId);
  const input = doc.getElementById(inputId);
  const searchButton = doc.getElementById(searchButtonId);
  const errorModal = doc.getElementById(errorModalId);
  const closeErrorButton = doc.getElementById(closeErrorButtonId);
  const exampleLinks = doc.getElementsByClassName(exampleLinkClass);

  const formStates = {
    init: () => {
      input.value = '';
      state.query = '';
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
      state.error.errorState = 'show';
    },
    errorNoResponse: () => {
      input.disabled = false;
      searchButton.disabled = false;
      searchButton.innerHTML = 'Read';
      state.error.errorState = 'show';
    },
    errorNoResponseUpdate: () => {
      state.error.errorState = 'show';
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

  const hasValidInput = (value, queryList) => {
    const isURLQuery = isURL(value);
    const isQueryListIncludesValue = queryList.includes(value);
    const isEmptyValue = !value.length;

    if (!isEmptyValue && (!isURLQuery || isQueryListIncludesValue)) {
      return false;
    }

    return true;
  };

  const handleInput = (value) => {
    const { queryList } = state;

    const isValidInput = hasValidInput(value, queryList);
    if (!isValidInput) {
      state.formState = 'invalid';
      return;
    }

    state.formState = 'valid';
    state.query = value;
  };

  [...exampleLinks].forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();

      const value = e.target.href;
      if (state.formState === 'loading') {
        return;
      }
      input.value = value;
      handleInput(value);
    });
  });

  const handleCloseErrorModal = () => {
    const { error } = state;

    error.errorState = 'hide';
  };

  const handleSubmit = () => {
    const { query } = state;

    state.formState = 'loading';

    const url = `${corsURL}/${query}`;

    const errorNoResponseTimerId = setTimeout(() => {
      state.formState = 'errorNoResponse';
    }, errorNoResponseTime);

    axios
      .get(url)
      .then(({ data }) => {
        if (state.formState === 'errorNoResponse') {
          return;
        }
        clearTimeout(errorNoResponseTimerId);
        const parsed = parse(data);
        state.feed = [...state.feed, parsed];
        state.queryList = [...state.queryList, query];
        state.formState = 'init';
      })
      .catch(() => {
        state.formState = 'error';
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
        state.formState = 'errorNoResponseUpdate';
      }, errorNoResponseTime);

      const promises = queryList
        .map((query) => `${corsURL}/${query}`)
        .map(axios.get);
      Promise.all(promises)
        .then((arr) => {
          if (state.formState === 'errorNoResponseUpdate') {
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
          state.formState = 'error';
        })
        .finally(checkForUpdates);
    }, checkUpdateInterval);
  };

  checkForUpdates();

  watch(state, 'feed', () => {
    render(state, doc, layout);
  });

  watch(state, 'formState', () => {
    const { formState } = state;

    formStates[formState]();
  });

  watch(state, 'error', () => {
    const { errorState } = state.error;

    errorModalStates[errorState]();
  });

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
