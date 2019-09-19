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
    formState: 'init',
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
    state.errorState = 'hide';
  };

  const handleSubmit = () => {
    const { query } = state;

    state.formState = 'loading';

    const url = `${corsURL}/${query}`;

    const errorNoResponseTimerId = setTimeout(() => {
      state.errorState = 'show';
      state.formState = 'init';
    }, errorNoResponseTime);

    axios
      .get(url)
      .then(({ data }) => {
        if (state.errorState === 'show') {
          return;
        }
        clearTimeout(errorNoResponseTimerId);
        state.formState = 'loaded';
        const parsed = parse(data);
        state.feed = [...state.feed, parsed];
        state.queryList = [...state.queryList, query];
      })
      .catch(() => {
        state.errorState = 'show';
      })
      .finally(() => {
        state.formState = 'init';
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

  watch(state, 'formState', () => {
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
