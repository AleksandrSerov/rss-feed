import $ from 'jquery';

export const getModal = (data) => {
  const description = data.querySelector('description').firstChild.data;
  const html = `
    <div class="modal" tabindex="-1" role="dialog">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Description</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <p>${description}</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    </div>
  `;

  const dom = htmlToElement(html);

  return dom;
};

export const build = (data) => {
  const { channels, articlesLists, channelsById, articlesListsById } = state;
  const id = uniqid();
  const channel = getChannel(data, id);
  const list = getArticlesList(data);

  setState({
    channels: {
      ...channels,
      [id]: channel,
    },
    channelsById: [...channelsById, id],
    articlesLists: {
      ...articlesLists,
      [id]: list,
    },
    articlesListsById: [...articlesListsById, id],
  });
  console.log(state);
};
