// This must be the first import of the application.
import 'react-hot-loader/patch';

import React from 'react';
import ReactDOM from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import { Provider } from 'react-redux';

import registerServiceWorker from 'setup/registerServiceWorker';
import { store } from 'setup/redux';
import Root from 'setup/Root';

const root = document.getElementById('root');

function renderRoot(Component) {
  ReactDOM.render(
    <AppContainer>
      <Provider store={store}>
        <Component />
      </Provider>
    </AppContainer>,
    root,
  );
}

renderRoot(Root);

if (module.hot) {
  module.hot.accept('setup/Root', () => {
    const NewRoot = require('setup/Root').default;
    renderRoot(NewRoot);
  });
}

registerServiceWorker();
