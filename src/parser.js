import _ from 'lodash';

const parser = new DOMParser();

const getUid = (item) => {
  const guid = item.querySelector('guid');
  if (guid) {
    return guid.innerHTML;
  }
  const pubDate = item.querySelector('pubDate');
  if (pubDate) {
    return pubDate.innerHTML;
  }
  const title = item.querySelector('title');
  return title.innerHTML;
};

const getArticles = (channel) => {
  const items = channel.querySelectorAll('item');
  return [...items].map((item) => {
    const title = item.querySelector('title').firstChild.data;
    const link = item.querySelector('link').innerHTML;
    const description = item.querySelector('description').firstChild.data;
    const articleId = _.uniqueId('article-');
    const uid = getUid(item);
    return {
      title,
      link,
      uid,
      articleId,
      description,
    };
  });
};

const getChannelInfo = (channel) => {
  const title = channel.querySelector('title').innerHTML;
  const text = channel.querySelector('description').firstChild.data;
  const channelId = _.uniqueId('channel-');
  return {
    channelId,
    title,
    text,
  };
};

export default (data) => {
  const xml = parser.parseFromString(data, 'text/xml');
  const channel = xml.querySelector('channel');
  const channelInfo = getChannelInfo(channel);
  const articles = getArticles(channel);
  return {
    ...channelInfo,
    articles,
  };
};
