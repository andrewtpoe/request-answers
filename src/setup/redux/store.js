import { compose, createStore } from 'redux';

import reducer from './reducer';
import setupSubscriptions from './subscribers';

export default function configureStore(initialState = {}, history) {
  // If Redux DevTools Extension is installed use it, otherwise use Redux compose
  const composeEnhancers =
    typeof window === 'object' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
      ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
      : compose;

  const store = createStore(
    reducer, // reducer
    initialState, // preloadedState
    composeEnhancers(), // enhancers
  );

  setupSubscriptions(store);

  return store;
}
