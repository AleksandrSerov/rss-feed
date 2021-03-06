import isURL from 'validator/lib/isURL';
import axios from 'axios';
import _ from 'lodash';
import { watch } from 'melanke-watchjs';
import parse from './parser';
import { renderFeed, renderForm, renderError } from './renders';
import { STATUS_SUCCESS } from './constants';

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

  const handleSubmit = async () => {
    const { query } = state;

    state.form.state = 'loading';

    const url = `${corsURL}/${query}`;

    const errorNoResponseTimerId = setTimeout(() => {
      state.errorState = 'open';
      state.form.state = 'init';
    }, errorNoResponseTime);
    try {
      const response = await axios.get(url);
      if (state.errorState === 'open') {
        return;
      }
      clearTimeout(errorNoResponseTimerId);
      if (response.status !== STATUS_SUCCESS) {
        state.errorState = 'open';
        return;
      }
      state.form.state = 'loaded';
      const { data } = response;
      const parsedFeed = parse(data);
      state.feed = [...state.feed, parsedFeed];
      state.queryList = [...state.queryList, query];
    } catch (error) {
      state.errorState = 'open';
    }
    state.form.state = 'init';
  };

  const checkForUpdates = () => {
    const checkUpdateTimerId = setTimeout(async () => {
      const { queryList, feed } = state;

      const isEmptyQueryList = !queryList.length;
      if (isEmptyQueryList) {
        clearTimeout(checkUpdateTimerId);
        checkForUpdates();
        return;
      }

      const errNoResponseUpdateTimerId = setTimeout(() => {
        state.errorState = 'open';
      }, errorNoResponseTime);

      try {
        const promises = queryList
          .map((query) => `${corsURL}/${query}`)
          .map(axios.get);

        const responses = await Promise.all(promises);
        if (state.errorState === 'open') {
          checkForUpdates();
          return;
        }
        clearTimeout(errNoResponseUpdateTimerId);
        responses
          .map((response) => {
            if (response.status !== STATUS_SUCCESS) {
              state.errorState = 'open';
              return null;
            }
            return response.data;
          })
          .filter((v) => v)
          .map(parse)
          .forEach(({ articles }, index) => {
            const currentFeed = feed[index];
            currentFeed.articles = _.unionBy(
              currentFeed.articles,
              articles,
              'uid',
            );
          });
      } catch (error) {
        state.errorState = 'open';
      }
      checkForUpdates();
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
