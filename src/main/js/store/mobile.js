import Vue from 'vue'
import Vuex from 'vuex'
import { MessageBox } from 'element-ui'
import dm5 from 'dm5'

Vue.use(Vuex)

const state = {

  object: undefined,        // If there is a single-selection: the selected Topic/Assoc/TopicType/AssocType.
                            // This object is displayed in detail panel or as in-map details. Its ID appears in the
                            // browser URL.
                            // Undefined if there is no selection or a multi-selection.

  writable: undefined,      // True if the current user has WRITE permission for the selected object.

  detailRenderers: {        // Registered detail renderers; comprises object renderers and value renderers:
    object: {},             //   {
    value: {}               //     typeUri: component
  },                        //   }

  quillConfig: {
    options: {
      theme: 'bubble',
      modules: {
        toolbar: {
          container: [
            ['bold', 'italic', 'code'],
            ['blockquote', 'code-block'],
            [{'list': 'ordered'}, {'list': 'bullet'}],
            [{'header': [1, 2, 3, false]}],
            [/* 'topic-link', TODO */ 'link', 'image', 'video']
          ]
        }
      }
    },
    // TODO: allow DMX webclient plugins to provide Quill extensions
    /* extensions: [    // TODO
      require('../topic-link').default
    ] */
  }
}

const actions = {

  displayObject (_, object) {
    // console.log('displayObject', object)
    state.object = object
    _initWritable()
  },

  emptyDisplay () {
    // console.log('emptyDisplay')
    state.object = undefined
  },

  submit ({dispatch}, object) {
    object.update().then(object => {
      dispatch('_processDirectives', object.directives)
    })
  },

  createTopic ({dispatch}, {topicType, value}) {
    // Note: for value integration to work at least all identity fields must be filled
    const topicModel = new dm5.Topic(topicType.newTopicModel(value)).fillChildren()
    // console.log('createTopic', topicModel)
    dm5.restClient.createTopic(topicModel).then(topic => {
      console.log('Created', topic)
      dispatch('callTopicRoute', topic.id)
      dispatch('_processDirectives', topic.directives)
    })
  },

  deleteMulti ({dispatch}, idLists) {
    confirmDeletion(idLists).then(() => {
      // console.log('deleteMulti', idLists.topicIds, idLists.assocIds)
      // update client state + sync view (for immediate visual feedback)
      idLists.topicIds.forEach(id => dispatch('_deleteTopic', id))
      idLists.assocIds.forEach(id => dispatch('_deleteAssoc', id))
      // update server state
      dm5.restClient.deleteMulti(idLists).then(object => {
        dispatch('_processDirectives', object.directives)
      })
    }).catch(() => {})    // suppress unhandled rejection on cancel
  },

  // ---

  unselectIf ({dispatch}, id) {
    // console.log('unselectIf', id, isSelected(id))
    if (isSelected(id)) {
      dispatch('stripSelectionFromRoute')
    }
  },

  // ---

  /**
   * @param   render    "object" or "value"
   */
  registerDetailRenderer (_, {renderer, typeUri, component}) {
    state.detailRenderers[renderer][typeUri] = component
  },

  //

  loggedIn () {
    initWritable()
  },

  loggedOut () {
    initWritable()
  },

  // WebSocket messages

  _processDirectives ({dispatch}, directives) {
    console.log(`Webclient: processing ${directives.length} directives`, directives)
    directives.forEach(dir => {
      switch (dir.type) {
      case "UPDATE_TOPIC":
        displayObjectIf(new dm5.Topic(dir.arg))
        break
      case "DELETE_TOPIC":
        dispatch('unselectIf', dir.arg.id)
        break
      case "UPDATE_ASSOCIATION":
        displayObjectIf(new dm5.Assoc(dir.arg))
        break
      case "DELETE_ASSOCIATION":
        dispatch('unselectIf', dir.arg.id)
        break
      }
    })
  }
}

const getters = {

  // Recalculate "object" once the underlying type changes.
  // The detail panel updates when a type is renamed.
  object: state => {
    // console.log('object getter', state.object, state.object && state.typeCache.topicTypes[state.object.uri])
    // ### FIXME: the asCompDef() approach does not work at the moment. Editing an comp def would send an
    // update model with by-URI players while the server expects by-ID players.
    return state.object && (state.object.isType()    ? state.object.asType() :
                            state.object.isCompDef() ? state.object.asCompDef() :
                            state.object)
    // logical copy in createDetail()/updateDetail() (topicmap-model.js of dm5-cytoscape-renderer module)
  },

  showInmapDetails: state => !state.details.visible
}

const store = new Vuex.Store({
  state,
  actions,
  getters
})

export default store

//

function displayObjectIf (object) {
  if (isSelected(object.id)) {
    store.dispatch('displayObject', object)
  }
}

function isSelected (id) {
  const object = state.object
  return object && object.id === id
}

function confirmDeletion (idLists) {
  const _size = size(idLists)
  if (!_size) {
    throw Error('confirmDeletion() called with empty idLists')
  }
  let message, buttonText
  if (_size > 1) {
    message = "You're about to delete multiple items"
    buttonText = `Delete ${_size} items`
  } else {
    message = `You're about to delete ${idLists.topicIds.length ? 'a topic' : 'an association'}`
    buttonText = 'Delete'
  }
  return MessageBox.confirm(message, 'Warning', {
    type: 'warning',
    confirmButtonText: buttonText,
    confirmButtonClass: 'el-button--danger',
    showClose: false
  })
}

// copy in cytoscape-view.js (module dm5-cytoscape-renderer)
// TODO: unify selection models (see selection.js in dmx-topicmaps module)
function size (idLists) {
  return idLists.topicIds.length + idLists.assocIds.length
}

//

function initWritable () {
   state.object && _initWritable()
}

function _initWritable () {
  state.object.isWritable().then(writable => {
    state.writable = writable
  })
}
