import { PageActions } from 'erschema-actions'
import schema from '../../../schemas'
import pageSchema from '../../../schemas/page'

class HomeActions extends PageActions {
  constructor(){
    super(schema, pageSchema, 'home')
  }
  getTodos = (todos) => dispatch => {
    dispatch(this.entities.getRelated('todos', todos))
  }
}

export default new HomeActions()