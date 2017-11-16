import { batchActions } from 'redux-batched-actions'
import Actions from 'erschema-actions'
import schema from '../schemas'

let nextId = 1;

function getId(){
  return ++nextId;
}

class ToDoActions extends Actions {
  constructor(){
    super(schema, 'todos')
  }
  create = (text)=>dispatch=>{
    dispatch(
      this.entities.createRelatedPage({
        id: getId(),
        text,
      }, 'home', 'todos')
    )
  }
  complete = (todo)=>dispatch=>{
    dispatch(
      this.entities.update({
        id: todo.id,
        completed: !todo.completed,
      })
    )
  }
  completeAll = (todos, allCompleted)=>dispatch=>{
    dispatch(
      batchActions(
        todos.map(t=>this.entities.update({
          id: t.id,
          completed: !allCompleted,
        }))
    ))
  }
  clearCompleted = (todos)=>dispatch=>{
    dispatch(batchActions(
      todos.filter(t=>t.completed).map(t=>this.entities.remove(t.id))
    ))
  }
}

export default new ToDoActions()