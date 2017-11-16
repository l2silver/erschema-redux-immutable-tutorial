# erschema-redux-immutable Tutorial

This tutorial is a transformation tutorial, where we turn the well known react-redux project frontend-boilerplate by TJH into the exact same functioning app, but using [erschema-redux-immutable](https://github.com/l2silver/erschema-redux-immutable). The final completed tutorial is available on the completed branch

``` git checkout completed```

## Install erschema-redux-immutable

```npm i -S erschema-redux-immutable```

## Add erschemaReducer to store

```
// ./client/reducers/index.js
+ import erschemaReducer from 'erschema-redux-immutable'

export default combineReducers({
  routing,
  todos,
+  erschema: erschemaReducer({
+    schema: {},
+    pageSchema: {},
+  }),
})
```

Run app, checkout store using chrome extension or console log it. You should now see the erschema property in the store. The schema and page schema are empty objects to begin with, but we'll be replacing those with the respective schemas shortly. For more information about schemas please checkout https://github.com/l2silver/erschema

## Add model

We're going to add two models to the project. The todo model, and the page home model

```
// ./client/models/ToDo/index.js

import { Record } from 'immutable';

export const properties = {
  id: '',
  text: '',
  completed: false,
}

export default class ToDo extends Record(properties) {}
```
We use models to format the date in the entities section of the erschema portion of the state. The todo entities need id, text, and completed

```
// ./client/models/pages/Home/index.js
import { Record } from 'immutable';

export const properties = {
}

export default class Home extends Record(properties) {}
```
We also need to create a model for the home entity in the pages part of the entities section of the erschema portion in the store. Although we don't technically need this model for this application because we aren't declaring any properties, it's just to demonstrate that if there were properties this is how we would add them.

## Add Schemas

We're going to create our [erschema schemas](https://github.com/l2silver/erschema) now. 

```
// ./client/schemas/todo.js

import Model, {properties} from '../models/ToDo'

export default {
  properties,
  Model,
}
```
```
// ./client/schemas/index.js

import todos from './todo'

export default {
  todos,
}
```

We're also going to create the page schema

```
// ./client/schemas/page/home.js
import {relationshipTypes} from 'erschema'
import Model, {properties} from '../../models/pages/Home'

export default {
  properties,
  Model,
  relationships: [
    {
      entityName: 'todos',
      type: relationshipTypes.MANY,
    }
  ]
}
```
```
// ./client/schemas/page/index.js
import home from './home'

export default {
  home,
}
```

## import schema into reducer

We're going to use these schemas to populate the entities and relationships section of the erschema portion of the store

```
// reducers/index.js
...
+ import schema from '../schemas'
+ import pageSchema from '../schemas/page'

export default combineReducers({
  routing,
  todos,
  erschema: erschemaReducer({
+    schema,
+    pageSchema,
  }),
})
```
checkout how entities and relations now include more information about the home page and todos

## Selectors

Selectors are how we retrieve data from the store. They are functions that generally follow this structure:

```(state, props)=>state.erschema...```

We're going to add selectors for the page home and for the todo entities. We're also going to use the erschema-selectors library, although one can create selectors very easily from scratch that work as well.

```
// ./client/selectors/todos/index.js

import Selector from 'erschema-selectors'
import ToDo from '../../models/ToDo'

export default new Selector('erschema', 'todos', new ToDo())
```
```
// ./client/selectors/pages/home/index.js
import Home from '../../../models/pages/Home'
import {PageSelector} from 'erschema-selectors'

export default new PageSelector('erschema', 'home', new Home())
```
## Use selectors in mapStateToProps function

We're going to switch out the simple mapStateToProps function with one that use the createStructuredSelector from the [reselect](https://github.com/reactjs/reselect) library. 

```
// ./client/containers/App/index.js
+ import { createSelector, createStructuredSelector } from 'reselect'
+ import homeSelectors from '../../selectors/pages/home'
+ import todoSelectors from '../../selectors/todos'

...
const mapStateToProps = createStructuredSelector({
  todos: createSelector([
    todoSelectors.get(homeSelectors.getRelatedIds('todos')),
  ], (listOfTodos)=>listOfTodos.toArray()),
})
```

The erschema-selectors will return an immutable List by default, but since this app is already built for an array of todos, we'll do the same. For most apps, it's best to use the List as deep down as possible in the application.

## Actions

Actions are used to dispatch changes to the store. We're going to use the library [erschema-actions](https://github.com/l2silver/erschema-actions) which provides us with a set of actions that add basic RESTFUL functionality


```
// ./client/actions/todos/index.js

import Actions from 'erschema-actions'
import schema from '../schemas'

class ToDoActions extends Actions {
  constructor(){
    super(schema, 'todos')
  }
}

export default new ToDoActions()
```
```
// ./client/actions/pages/home/index.js

import { PageActions } from 'erschema-actions'
import schema from '../../../schemas'
import pageSchema from '../../../schemas/page'

class HomeActions extends PageActions {
  constructor(){
    super(schema, pageSchema, 'home')
  }
}

export default new HomeActions()
```

## Create get todos action

The original app starts with one todo, but unlike the original, we can't just create the store with an initial state that already includes the one todo. Instead we'll use a get action to pass an array of todos into the store.

```
// ./client/actions/pages/home/index.js

class HomeActions extends PageActions {
  ...
  getTodos = (todos) => dispatch => {
    dispatch(this.entities.getRelated('todos', todos))
  }
}
```

We'll need to add this action to the mapDispatchToProps function in App container

```
// ./client/containers/App/index.js
+ import homeActions from '../../actions/pages/home'

...

function mapDispatchToProps(dispatch) {
  return {
    actions: 
      bindActionCreators({
        getTodos: homeActions.getTodos,
      }, dispatch),
    }
  }
}
```

We'll also need to call this action on componentWillMount

```
// ./client/containers/App/index.js
...
class App extends Component {
  componentWillMount(){
    this.props.actions.getTodos([{
      id: 1,
      text: 'Use Redux',
    }])
  }
  ...
```

## Add higher order reducers

When you start the app, you should see the GET_TODOS action being called, but no change in state. This is because we have not setup all the higher order reducers that are required to properly run erschema-redux-immutable.

We are using:
 * [redux-batched-actions](https://github.com/tshelburne/redux-batched-actions)
 * [redux-retype-actions](https://github.com/l2silver/redux-retype-actions)
 * [redux-compose-hors](https://github.com/l2silver/redux-compose-hors)
 * [redux-thunk](https://github.com/gaearon/redux-thunk)

```
// ./client/store/index.js

+ import thunk from 'redux-thunk'
+ import { enableBatching } from 'redux-batched-actions';
+ import { enableRetyping } from 'redux-retype-actions';
+ import composeHors from 'redux-compose-hors';

...

const createStoreWithMiddleware = applyMiddleware(
   logger,
+  thunk,
)(create)

+ const store = createStoreWithMiddleware(composeHors(rootReducer, enableBatching, enableRetyping), initialState)
...
```
* redux-thunk isn't actually required for immutable, but it's good practice to use for more complex apps

Now when you start the app, you should see the beginning todo

## Add create action

```
// ./client/actions/todos.js

...

+ let nextId = 1;

+ function getId(){
+  return ++nextId;
+ }

class ToDoActions extends Actions {
  ...
  create = (text)=>dispatch=>{
    dispatch(
      this.entities.createRelatedPage({
        id: getId(),
        text,
      }, 'home', 'todos')
    )
  }
```

Since we're using erschema-actions, all of the entity actions are stored in this.actions . We're using the createRelatedPage action because we are creating a todo, and then linking that todo to the home page. The createRelatedPage is really just two actions batched together, the this.entities.create action which creates the entity, and the this.relationships.link action which adds the entity's id to the designated relationship (in this case the relationship is named 'todos').

We also need to add the action to the mapDispatchToProps function

```
// ./client/containers/App/index.js
+ import todoActions from '../../actions/todos'

...

function mapDispatchToProps(dispatch) {
  return {
    actions: 
      bindActionCreators({
        getTodos: homeActions.getTodos,
        addTodo: todoActions.create,
        deleteTodo: todoActions.entities.remove,
      }, dispatch),
    }
  }
}
```
We also added the deleteTodo action simply using the base remove action provided through entities.

## Add complete

We're going to add the ability to toggle the todo either completed or incomplete. First we create the action:

```
// ./client/actions/todos.js

...
class ToDoActions extends Actions {
  ...
  complete = (todo)=>dispatch=>{
    dispatch(
      this.entities.update({
        id: todo.id,
        completed: !todo.completed,
      })
    )
  }
```
Add action to mapDispatchToProps
```
// ./client/containers/App/index.js

...

function mapDispatchToProps(dispatch) {
  return {
    actions: 
      bindActionCreators({
        getTodos: homeActions.getTodos,
        addTodo: todoActions.create,
        deleteTodo: todoActions.entities.remove,
        completeTodo: todoActions.complete,
      }, dispatch),
    }
  }
}
```

Since the original complete action only uses the id, we need to make one more change

```
// ./client/components/TodoItem/index.js

...

render() {
    const {todo, incompleteTodo, completeTodo, deleteTodo} = this.props

    let element
    if (this.state.editing) {
      element = (
        <TodoTextInput text={todo.text}
           editing={this.state.editing}
           onSave={(text) => this.handleSave(todo.id, text)} />
      )
    } else {
      element = (
        <div className={style.view}>
          <input className={style.toggle}
             type="checkbox"
             checked={todo.completed}
-            onChange={() => completeTodo(todo.id)} />
+            onChange={() => completeTodo(todo)} />

          <label onDoubleClick={::this.handleDoubleClick}>
            {todo.text}
          </label>

          <button className={style.destroy} onClick={() => deleteTodo(todo.id)} />
        </div>
      )
    }
```

## Add complete all

The original app allowed you to mark all todos as complete with a single click. We'll add the action.

```
// ./client/actions/todos.js

+ import { batchActions } from 'redux-batched-actions'
...

class ToDoActions extends Actions {
  ...
  completeAll = (todos, allCompleted)=>dispatch=>{
    dispatch(
      batchActions(
        todos.map(t=>this.entities.update({
          id: t.id,
          completed: !allCompleted,
        }))
    ))
  }
```

Here we're using the batchedActions action to group several update actions together so that react only tries to rerender once. We add the action to mapDispatchToProps

Add action to mapDispatchToProps
```
// ./client/containers/App/index.js

...

function mapDispatchToProps(dispatch) {
  return {
    actions: 
      bindActionCreators({
        getTodos: homeActions.getTodos,
        addTodo: todoActions.create,
        deleteTodo: todoActions.entities.remove,
        completeTodo: todoActions.complete,
        completeAll: todoActions.completeAll,
      }, dispatch),
    }
  }
}
```

And since the original function did not take an argument, we need to modify where this action is being to called to take the array of todos

```
// ./client/components/MainSection/index.js

  ...
  renderToggleAll(completedCount) {
    const { todos, actions } = this.props
    const allCompleted = completedCount === todos.length
    if (todos.length > 0) {
      return <input
        className={style.toggleAll}
        type="checkbox"
        checked={allCompleted}
        onChange={()=>actions.completeAll(todos, allCompleted)} />
    }
  }
```

## Add clear completed

This is the final test. See if you can complete this step on your own. Check the completed branch for the final solution (doesn't have to exactly match, only the functionality matters)

That concludes the tutorial!

Original Readme

__I don't use this anymore, it's unsupported, use https://github.com/mozilla-neutrino/neutrino-dev__.

# Frontend Boilerplate

A boilerplate of things that mostly shouldn't exist.

## Contains

- [x] [Webpack](https://webpack.github.io)
- [x] [React](https://facebook.github.io/react/)
- [x] [Redux](https://github.com/reactjs/redux)
- [x] [Babel](https://babeljs.io/)
- [x] [Autoprefixer](https://github.com/postcss/autoprefixer)
- [x] [PostCSS](https://github.com/postcss/postcss)
- [x] [CSS modules](https://github.com/outpunk/postcss-modules)
- [x] [Rucksack](http://simplaio.github.io/rucksack/docs)
- [x] [React Router Redux](https://github.com/reactjs/react-router-redux)
- [x] [Redux DevTools Extension](https://github.com/zalmoxisus/redux-devtools-extension)
- [ ] Redux effects
- [x] TodoMVC example

## Setup

```
$ npm install
```

## Running

```
$ npm start
```

## Build

```
$ npm run build
```

## Note

My personal projects have diverged from this quite a bit, I use browserify now instead etc, but feel free to use this if it fits your needs! I won't be updating it a ton for now unless I have time to update it to match my current workflow.

# License

MIT
