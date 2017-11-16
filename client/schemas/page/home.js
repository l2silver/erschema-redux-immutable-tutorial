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
