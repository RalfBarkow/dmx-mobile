import DM5WebSocket from 'dm5-websocket'
import store from './store/mobile'
import dm5 from 'dm5'

const clientId = newClientId()
updateClientIdCookie()

window.addEventListener('focus', updateClientIdCookie)

/* eslint no-new: 0 */

new DM5WebSocket('systems.dmx.webclient', dispatcher)

function dispatcher (message) {
  store.dispatch('_' + message.type, message.args)
}

function newClientId () {
  return Math.floor(Number.MAX_SAFE_INTEGER * Math.random())
}

function updateClientIdCookie () {
  // console.log('dmx_client_id', clientId)
  dm5.utils.setCookie('dmx_client_id', clientId)
}
