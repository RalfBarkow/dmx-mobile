const state = {
  tab: 'info',        // Selected tab: 'info', 'related', 'meta', 'view'.
                      // Note: form edit takes place in "info" tab, while 'mode' is set to 'form'.
  mode: 'info'        // Mode of the "info" tab: 'info' or 'form'.
}

const actions = {
  selectDetail (_, detail) {
    // console.log('selectDetail', detail)
    if (!['info', 'edit', 'related', 'meta', 'view'].includes(detail)) {
      throw Error(`"${detail}" is not an expected detail name`)
    }
    if (detail === 'info') {
      state.tab = 'info'
      state.mode = 'info'
    } else if (detail === 'edit') {
      state.tab = 'info'
      state.mode = 'form'
    } else {
      state.tab = detail
    }
  }
}

export default {
  state,
  actions
}
