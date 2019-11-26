import Vue from 'vue'
import App from './components/App'
import dm5 from 'dm5'
import store from './store/mobile'
import router from './router'
import onHttpError from './error-handler'
import 'font-awesome/css/font-awesome.css'
import './element-ui'
// import './websocket'   // ### TODO

console.log('[DMX Mobile] 2019/11/26')

// 1) Init dm5 library
// The dm5 library must be inited *before* the dm5-webclient component is instantiated.
// The dm5-webclient component relies on the "typeCache" store module as registered by dm5.init(). ### TODO: still true?
const dm5ready = dm5.init({
  store,
  onHttpError
})

// 2) Register store modules
store.registerModule('login',   require('./store/login').default)
store.registerModule('search',  require('./store/search').default)
store.registerModule('details', require('./store/details').default)

// 3) Register store watcher
store.watch(
  state => state.login.username,
  username => {
    if (username) {
      dm5.restClient.getPrivateWorkspace().then(workspace => {
        dm5.utils.setCookie('dmx_workspace_id', workspace.id)
      })
    } else {
      dm5.utils.deleteCookie('dmx_workspace_id')
    }
  }
)

// 4) Create Vue root instance
// Instantiates router-view and dm5-webclient components.
const root = new Vue({
  el: '#app',
  store,
  router,
  render: h => h(App)
})

// 5) Initial navigation
// Initial navigation must take place *after* the webclient plugins are loaded.
// The "workspaces" store module is registered by the Workspaces plugin.
Promise.all([
  // Both, the Topicmap Panel and the Detail Panel, rely on a populated type cache.
  // The type cache must be ready *before* "initialNavigation" is dispatched.
  dm5ready,
  // Initial navigation might involve "select the 1st workspace", so the workspace
  // topics must be already loaded.
  // store.state.workspaces.ready   // ### TODO?
]).then(() => {
  store.dispatch('initialNavigation')
})
