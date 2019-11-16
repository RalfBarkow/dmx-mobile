const state = {

  visible: false,             // search widget visibility

  options: {
    noSelect: false,          // Optional: if trueish the revealed topic will not be selected. Otherwise it will.
    topicHandler: undefined   // Optional: a handler that is invoked subsequently to "revealTopic".
                              // The revealed topic is passed.
  },

  extraMenuItems: []          // Extra type menu items which require special create logic.
}

const actions = {

  openSearchWidget (_, options) {
    // console.log('openSearchWidget', options)
    state.visible = true
    state.options = options
  },

  closeSearchWidget () {
    state.visible = false
  },

  registerExtraMenuItems (_, items) {
    state.extraMenuItems = [...state.extraMenuItems, ...items]
  }
}

const getters = {
  menuTopicTypes: (state, getters, rootState) => {
    const topicTypes = rootState.typeCache.topicTypes     // undefined while webclient launch
    return topicTypes && Object.values(topicTypes)
      .filter(topicType => topicType.getViewConfig('dmx.webclient.add_to_create_menu'))
      .sort((tt1, tt2) => tt1.value.localeCompare(tt2.value))
  }
}

export default {
  state,
  actions,
  getters
}
