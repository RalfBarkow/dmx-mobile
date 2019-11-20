<template>
  <div class="dm5-mobile">
    <dm5-main-menu></dm5-main-menu>
    <dm5-login-dialog :visible="loginVisible" @logged-in="loggedIn" @close="closeLogin"></dm5-login-dialog>
    <dm5-search-widget :visible="searchVisible" :create-enabled="createEnabled" :menu-topic-types="menuTopicTypes"
      width="96%" layout="column" @topic-reveal="revealTopic" @topic-create="createTopic" @close="closeSearch">
    </dm5-search-widget>
    <dm5-detail-panel :object="object" :writable="writable" :tab="tab" :mode="mode" :quill-config="quillConfig"
      no-pin-button @tab-click="tabClick" @edit="edit" @submit="submit" @submit-inline="submitInline"
      @child-topic-reveal="revealTopic" @related-topic-click="revealTopic" @related-icon-click="revealTopic">
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

    tab () {
      return this.$store.state.details.tab
    },

    mode () {
      return this.$store.state.details.mode
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

    createEnabled () {
      return this.$store.state.login.username !== ''
    },

    menuTopicTypes () {
      return this.$store.getters.menuTopicTypes
    }
  },

  methods: {

    loggedIn (username) {
      this.$store.dispatch('loggedIn', username)
    },

    closeLogin () {
      this.$store.dispatch('closeLoginDialog')
    },

    revealTopic (topic) {
      this.$store.dispatch('callTopicRoute', topic.id)
    },

    createTopic ({topicType, value}) {
      this.$store.dispatch('createTopic', {topicType, value})
    },

    closeSearch () {
      this.$store.dispatch('closeSearchWidget')
    },

    tabClick (tab) {
      let detail = tab
      // clicking 1st tab while in form mode
      if (tab === 'info' && this.mode === 'form') {
        // 1st tab is selected already -> no-op
        if (this.tab === 'info') {
          return
        }
        // another tab is currently selected -> resume editing
        detail = 'edit'
      }
      //
      this.$store.dispatch('selectDetail', detail)
    },

    edit () {
      this.$store.dispatch('selectDetail', 'edit')
    },

    submit (object) {
      this.$store.dispatch('submit', object)
      this.$store.dispatch('selectDetail', 'info')
    },

    submitInline (object) {
      this.$store.dispatch('submit', object)
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
