/**
 * The router.
 * - Initializes app state according to start URL.
 * - Adapts app state when URL changes.
 */

import Vue from 'vue'
import VueRouter from 'vue-router'
import { MessageBox } from 'element-ui'
import Mobile from './components/dm5-mobile'
import store from './store/mobile'
import dm5 from 'dm5'

Vue.use(VueRouter)

const router = new VueRouter({
  routes: [
    {
      path: '/',
      name: 'default',
      component: Mobile
    },
    {
      path: '/topic/:topicId',
      name: 'topic',
      component: Mobile
    },
    {
      path: '/assoc/:assocId',
      name: 'assoc',
      component: Mobile
    },
    {
      path: '/topic/:topicId/:detail',
      name: 'topicDetail',
      component: Mobile
    },
    {
      path: '/assoc/:assocId/:detail',
      name: 'assocDetail',
      component: Mobile
    }
  ]
})

// use a global guard to perform dirty check
router.beforeEach((to, from, next) => {
  // Perform a dirty check if all conditions apply:
  //   - there is a selection (the detail panel is not empty)
  //   - in the route there is a selection change
  if (store.state.object && objectId(to) !== objectId(from)) {
    const detailPanel = document.querySelector('.dm5-detail-panel').__vue__
    const isDirty = detailPanel.isDirty()
    // console.log('isDirty', isDirty, store.state.object.id)
    if (isDirty) {
      MessageBox.confirm('There are unsaved changes', 'Warning', {
        type: 'warning',
        confirmButtonText: 'Save',
        cancelButtonText: 'Discard Changes',
        distinguishCancelAndClose: true
      }).then(action => {   // -> Save
        detailPanel.save()
        next()
      }).catch(action => {
        switch (action) {
        case 'cancel':      // -> Discard Changes
          next()
          break;
        case 'close':       // -> Abort Navigation
          next(false)
          break;
        default:
          throw Error(`unexpected MessageBox action: "${action}"`)
        }
      })
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router

store.registerModule('routerModule', {

  state: {
    router
  },

  actions: {

    initialNavigation () {
      initialNavigation(router.currentRoute)
    },

    callRoute (_, location) {
      // console.log('callRoute', location)
      router.push(location)
    },

    callTopicRoute (_, id) {
      callObjectRoute(id, 'topicId', 'topic', 'topicDetail')
    },

    callAssocRoute (_, id) {
      callObjectRoute(id, 'assocId', 'assoc', 'assocDetail')
    },

    stripSelectionFromRoute () {
      router.push({
        name: 'default'
      })
    },

    /**
     * Redirects to "topicDetail" or "assocDetail" route, depending on current selection.
     *
     * Prerequisite: a single selection
     *
     * @param   detail    "info", "related", "meta", "view" or "edit"
     */
    callDetailRoute ({rootState}, detail) {
      const object = rootState.object
      if (!object) {
        throw Error('callDetailRoute() when there is no single selection')
      }
      router.push({
        name: object.isTopic() ? 'topicDetail' : 'assocDetail',
        params: {detail}
      })
    },

    /**
     * Redirects to "topicDetail" route.
     *
     * @param   id        a topic ID
     * @param   detail    "info", "related", "meta", "view" or "edit"
     */
    callTopicDetailRoute (_, {id, detail}) {
      router.push({
        name: 'topicDetail',
        params: {topicId: id, detail}
      })
    },

    /**
     * Redirects to "assocDetail" route.
     *
     * @param   id        an assoc ID
     * @param   detail    "info", "related", "meta", "view" or "edit"
     */
    callAssocDetailRoute (_, {id, detail}) {
      router.push({
        name: 'assocDetail',
        params: {assocId: id, detail}
      })
    },

    stripDetailFromRoute ({rootState}) {
      const object = rootState.object
      if (!object) {
        throw Error('stripDetailFromRoute() when there is no single selection')
      }
      router.push({
        name: object.isTopic() ? 'topic' : 'assoc'
      })
    }
  }
})

/**
 * Redirects to "topic"/"assoc" route while retaining the selected detail tab (if any).
 *
 * Falls back to "info" tab in 2 cases: when we're coming from ...
 *   - form mode (we don't want stay in form mode when user selects another topic/assoc)
 *   - empty (pinned) detail panel (we don't want restore the tab that was selected before emptying the panel)
 */
function callObjectRoute (id, paramName, routeName, detailRouteName) {
  const location = {
    params: {[paramName]: id}
  }
  // Note: normally the route is the source of truth. But there is an app state not represented in the route: an empty
  // (pinned) detail panel. We detect that by inspecting both, the "details.visible" app state AND the route's "detail"
  // segment.
  if (store.state.details.visible) {
    location.name = detailRouteName
    // fallback to "info" tab
    // Note: when the detail panel is empty there is no "detail" route segment
    const detail = router.currentRoute.params.detail
    if (!detail || detail === 'edit') {
      location.params.detail = 'info'
    }
  } else {
    location.name = routeName
  }
  router.push(location)
}

// TODO: why does the watcher kick in when an initial URL is present?
// Since when is it this way?
function registerRouteWatcher () {
  store.watch(
    state => state.routerModule.router.currentRoute,
    (to, from) => {
      // console.log('### Route watcher', to, from)
      navigate(to, from)
    }
  )
}

// ### TODO: unify these 2 functions?

/**
 * Sets up initial app state according to start URL.
 */
function initialNavigation (route) {
  //
  registerRouteWatcher()
  //
  // 1) topic/assoc selection
  // Note: route params read from URL are strings (may be undefined). Route params set by push() are numbers.
  const topicId = id(route.params.topicId)
  const assocId = id(route.params.assocId)
  topicId !== undefined && fetchTopic(topicId)                // Note: 0 is a valid topic ID
  assocId               && fetchAssoc(assocId)
  // 2) detail panel
  const detail = route.params.detail
  if (detail) {
    store.dispatch('selectDetail', detail)
  }
}

/**
 * Adapts app state when route changes.
 */
function navigate (to, from) {
  // 1) topic/assoc selection
  const topicId = id(to.params.topicId)
  const assocId = id(to.params.assocId)
  const oldTopicId = id(from.params.topicId)
  const oldAssocId = id(from.params.assocId)
  const topicChanged = topicId !== oldTopicId
  const assocChanged = assocId !== oldAssocId
  if (topicChanged && topicId !== undefined) {             // Note: 0 is a valid topic ID
    fetchTopic(topicId)
  }
  if (assocChanged && assocId) {
    fetchAssoc(assocId)
  }
  if ((topicChanged || assocChanged) && topicId === undefined && !assocId) {    // Note: 0 is a valid topic ID
    store.dispatch('emptyDisplay')
  }
  // 2) detail panel
  const detail = to.params.detail
  const oldDetail = from.params.detail
  if (detail != oldDetail && detail) {
    store.dispatch('selectDetail', detail)
  }
}

/**
 * Fetches the given topic and displays it in the detail panel.
 */
function fetchTopic (id) {
  dm5.restClient.getTopic(id, true, true).then(topic => {       // includeChildren=true, includeAssocChildren=true
    store.dispatch('displayObject', topic)
    store.dispatch('selectDetail', 'info')
  })
}

/**
 * Fetches the given assoc and displays it in the detail panel.
 */
function fetchAssoc (id) {
  dm5.restClient.getAssoc(id, true, true).then(assoc => {       // includeChildren=true, includeAssocChildren=true
    store.dispatch('displayObject', assoc)
    store.dispatch('selectDetail', 'info')
  })
}

/**
 * @return  an ID (type Number) or undefined
 */
function objectId(route) {
  return id(route.params.assocId || route.params.topicId)     // Note: 0 is a valid topic ID; check assoc ID first
}

/**
 * Converts the given value into Number.
 *
 * @return  the number, or undefined if `undefined` or `null` is given.
 *          Never returns `null`.
 *
 * @throws  if the given value is not one of Number/String/undefined/null.
 */
function id (v) {
  // Note: Number(undefined) is NaN, and NaN != NaN is true!
  // Note: dm5.utils.getCookie may return null, and Number(null) is 0 (and typeof null is 'object')
  if (typeof v === 'number') {
    return v
  } else if (typeof v === 'string') {
    return Number(v)
  } else if (v !== undefined && v !== null) {
    throw Error(`id() expects one of [number|string|undefined|null], got ${v}`)
  }
}
