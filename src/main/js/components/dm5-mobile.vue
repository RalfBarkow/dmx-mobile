<template>
  <div class="dm5-mobile">
    <dm5-main-menu></dm5-main-menu>
    <dm5-login-dialog :visible="loginVisible" @logged-in="loggedIn" @close="closeLogin"></dm5-login-dialog>
    <dm5-search-widget :visible="searchVisible" :menu-topic-types="menuTopicTypes" width="96%"
      @topic-reveal="revealTopic" @close="closeSearch">
    </dm5-search-widget>
    <dm5-detail-panel :object="object" :writable="writable" :quill-config="quillConfig" no-pin-button>
    </dm5-detail-panel>
  </div>
</template>

<script>
export default {

  computed: {

    object () {
      return this.$store.state.object
    },

    writable () {
      return this.$store.state.writable
    },

    quillConfig () {
      return this.$store.state.quillConfig
    },

    loginVisible () {
      return this.$store.state.login.visible
    },

    searchVisible () {
      return this.$store.state.search.visible
    },

    menuTopicTypes () {
      return this.$store.getters.menuTopicTypes
    }
  },

  methods: {

    revealTopic (topic) {
      this.$store.dispatch('callTopicRoute', topic.id)
    },

    loggedIn (username) {
      this.$store.dispatch('loggedIn', username)
    },

    closeLogin () {
      this.$store.dispatch('closeLoginDialog')
    },

    closeSearch () {
      this.$store.dispatch('closeSearchWidget')
    }
  },

  components: {
    'dm5-main-menu':     require('./dm5-main-menu').default,
    'dm5-login-dialog':  require('dm5-login-dialog').default,
    'dm5-search-widget': require('dm5-search-widget').default,
    'dm5-detail-panel':  require('dm5-detail-panel').default
  }
}
</script>

<style>
.dm5-mobile {
  height: 100%;
  display: flex;
}

.dm5-mobile .dm5-detail-panel {
  flex-grow: 1;
  background-color: var(--background-color);
}
</style>
