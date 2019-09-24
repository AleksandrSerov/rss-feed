import isURL from 'validator/lib/isURL';
import axios from 'axios';
import _ from 'lodash';
import { watch } from 'melanke-watchjs';
import parse from './parser';
import { renderFeed, renderForm, renderError } from './renders';

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
    form: {
      state: 'init',
      inputValue: '',
    },
    feed: [],
    errorState: 'hide',
    query: '',
    queryList: [],
  };

  const { formId, inputId, closeErrorButtonId, exampleLinkClass } = layout;

  const form = doc.getElementById(formId);
  const input = doc.getElementById(inputId);
  const closeErrorButton = doc.getElementById(closeErrorButtonId);
  const exampleLinks = doc.getElementsByClassName(exampleLinkClass);

  const hasValidInput = (value) => {
    const isURLQuery = isURL(value);
    const isEmptyValue = !value.length;

    if (!isEmptyValue && !isURLQuery) {
      return false;
    }

    return true;
  };

  const handleInput = (value) => {
    const { queryList } = state;

    const isValidInput = hasValidInput(value);
    const isQueryListIncludesValue = queryList.includes(value);

    if (!isValidInput || isQueryListIncludesValue) {
      state.form = {
        state: 'invalid',
        inputValue: value,
      };
      return;
    }

    state.form = {
      state: 'valid',
      inputValue: value,
    };
    state.query = value;
  };

  [...exampleLinks].forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();

      const value = e.target.href;
      if (state.form.state === 'loading') {
        return;
      }
      handleInput(value);
    });
  });

  const handleCloseErrorModal = () => {
    state.errorState = 'hide';
  };

  const handleSubmit = () => {
    const { query } = state;

    state.form.state = 'loading';

    const url = `${corsURL}/${query}`;

    const errorNoResponseTimerId = setTimeout(() => {
      state.errorState = 'show';
      state.form.state = 'init';
    }, errorNoResponseTime);

    axios
      .get(url)
      .then(({ data }) => {
        if (state.errorState === 'show') {
          return;
        }
        clearTimeout(errorNoResponseTimerId);
        state.form.state = 'loaded';
        const parsedFeed = parse(data);
        state.feed = [...state.feed, parsedFeed];
        state.queryList = [...state.queryList, query];
      })
      .catch(() => {
        state.errorState = 'show';
      })
      .finally(() => {
        state.form.state = 'init';
      });
  };

  const checkForUpdates = () => {
    const checkUpdateTimerId = setTimeout(() => {
      const { queryList, feed } = state;

      const isEmptyQueryList = !queryList.length;
      if (isEmptyQueryList) {
        clearTimeout(checkUpdateTimerId);
        checkForUpdates();
        return;
      }

      const errNoResponseUpdateTimerId = setTimeout(() => {
        state.errorState = 'show';
      }, errorNoResponseTime);

      const promises = queryList
        .map((query) => `${corsURL}/${query}`)
        .map(axios.get);
      Promise.all(promises)
        .then((arr) => {
          if (state.errorState === 'show') {
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
          state.errorState = 'show';
        })
        .finally(checkForUpdates);
    }, checkUpdateInterval);
  };

  checkForUpdates();

  watch(state, 'feed', () => {
    renderFeed(state, doc, layout);
  });

  watch(state, 'form', () => {
    renderForm(state, doc, layout);
  });

  watch(state, 'errorState', () => {
    renderError(state, doc, layout);
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
