
import { createStore, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import { enableBatching } from 'redux-batched-actions';
import { enableRetyping } from 'redux-retype-actions';
import composeHors from 'redux-compose-hors';

import { logger } from '../middleware'
import rootReducer from '../reducers'

export default function configure(initialState) {
  const create = window.devToolsExtension
    ? window.devToolsExtension()(createStore)
    : createStore

  const createStoreWithMiddleware = applyMiddleware(
    logger,
    thunk,
  )(create)

  const store = createStoreWithMiddleware(composeHors(rootReducer, enableBatching, enableRetyping), initialState)

  if (module.hot) {
    module.hot.accept('../reducers', () => {
      const nextReducer = require('../reducers')
      store.replaceReducer(nextReducer)
    })
  }

  return store
}
