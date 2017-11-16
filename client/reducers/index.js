
import { routerReducer as routing } from 'react-router-redux'
import { combineReducers } from 'redux'
import erschemaReducer from 'erschema-redux-immutable'
import todos from './todos'
import schema from '../schemas'
import pageSchema from '../schemas/page'

export default combineReducers({
  routing,
  todos,
  erschema: erschemaReducer({
    schema,
    pageSchema,
  }),
})
