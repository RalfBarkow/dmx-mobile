<template>
  <div class="dm5-mobile">
    <el-dropdown size="medium" trigger="click" @command="handle">
      <span class="fa fa-bars"></span>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item command="openSearchWidget">Search / Create</el-dropdown-item>
        <el-dropdown-item command="openLoginDialog" divided>Login</el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
    <dm5-login-dialog :visible="loginVisible" @login="login" @close="closeLogin"></dm5-login-dialog>
    <dm5-search-widget :visible="searchVisible" :menu-topic-types="menuTopicTypes" width="96%"
      @topic-reveal="revealTopic" @close="closeSearch">
    </dm5-search-widget>
    <dm5-detail-panel :object="object" :quill-config="quillConfig" no-pin-button></dm5-detail-panel>
  </div>
</template>

<script>
export default {

  computed: {

    object () {
      return this.$store.state.object
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

    handle (command) {
      this.$store.dispatch(command)
    },

    revealTopic (topic) {
      this.$store.dispatch('callTopicRoute', topic.id)
    },

    login (username) {
      this.$store.dispatch('login', username)
    },

    closeLogin () {
      this.$store.dispatch('closeLoginDialog')
    },

    closeSearch () {
      this.$store.dispatch('closeSearchWidget')
    }
  },

  components: {
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

.dm5-mobile > .el-dropdown {
  position: absolute;
  top: 6px;
  right: 6px;
  z-index: 1;
  font-size: 18px;
  color: var(--label-color);
}
</style>
