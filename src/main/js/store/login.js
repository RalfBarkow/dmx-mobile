import dm5 from 'dm5'

const state = {
  username: undefined,      // logged in user (string); falsish if no user is logged in
  visible: false,           // login dialog visibility
}

const actions = {

  login (username) {
    this.username = username
  },

  openLoginDialog () {
    state.visible = true
  },

  closeLoginDialog () {
    state.visible = false
  }
}

export default {
  state,
  actions
}

// init state

dm5.restClient.getUsername().then(username => {
  console.log('username', username)
  state.username = username
})
