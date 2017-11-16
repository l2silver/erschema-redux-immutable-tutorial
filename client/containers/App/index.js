
import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { createSelector, createStructuredSelector } from 'reselect'
import Header from '../../components/Header'
import MainSection from '../../components/MainSection'
import todoActions from '../../actions/todos'
import homeActions from '../../actions/pages/home'
import homeSelectors from '../../selectors/pages/home'
import todoSelectors from '../../selectors/todos'
import style from './style.css'

class App extends Component {
  componentWillMount(){
    this.props.actions.getTodos([{
      id: 1,
      text: 'Use Redux',
    }])
  }
  render() {
    const { todos, actions, children } = this.props
    return (
      <div className={style.normal}>
        <Header addTodo={actions.addTodo} />
        <MainSection todos={todos} actions={actions} />
        {children}
      </div>
    )
  }
}

const mapStateToProps = createStructuredSelector({
  todos: createSelector([
    todoSelectors.get(homeSelectors.getRelatedIds('todos')),
  ], (listOfTodos)=>listOfTodos.toArray()),
})

function mapDispatchToProps(dispatch) {
  return {
    actions: {
      ...bindActionCreators({
        getTodos: homeActions.getTodos,
        addTodo: todoActions.create,
        deleteTodo: todoActions.entities.remove,
        completeTodo: todoActions.complete,
        incompleteTodo: todoActions.incomplete,
        completeAll: todoActions.completeAll,
        clearCompleted: todoActions.clearCompleted,
      }, dispatch),
      
    }
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App)
