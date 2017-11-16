import { Record } from 'immutable';

export const properties = {
  id: '',
  text: '',
  completed: false,
}

export default class ToDo extends Record(properties) {}
