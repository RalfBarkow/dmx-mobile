<template>
  <div class="dm5-mobile">
    <el-dropdown size="medium" trigger="click" @command="handle">
      <span class="fa fa-bars"></span>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item command="openSearchWidget">Search / Create</el-dropdown-item>
        <el-dropdown-item divided>Login</el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
    <dm5-detail-panel :object="object" :quill-config="quillConfig"></dm5-detail-panel>
    <dm5-search-widget :visible="visible" :menu-topic-types="menuTopicTypes" @topic-reveal="revealTopic" @close="close">
    </dm5-search-widget>
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

    visible () {
      return this.$store.state.search.visible
    },

    menuTopicTypes () {
      return this.$store.getters.menuTopicTypes
    }
  },

  methods: {

    handle (command) {
      if (command) {
        this.$store.dispatch(command)
      }
    },

    revealTopic (topic) {
      this.$store.dispatch('callTopicRoute', topic.id)
    },

    close () {
      this.$store.dispatch('closeSearchWidget')
    }
  },

  components: {
    'dm5-detail-panel':  require('dm5-detail-panel').default,
    'dm5-search-widget': require('dm5-search-widget').default
  }
}
</script>
