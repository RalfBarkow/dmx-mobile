<template>
  <div class="dm5-mobile">
    <el-dropdown size="medium" trigger="click" @command="handle">
      <span class="fa fa-bars"></span>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item command="openSearchWidget">Search / Create</el-dropdown-item>
        <el-dropdown-item>Login</el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
    <dm5-search-widget :visible="visible" :menu-topic-types="menuTopicTypes" @close="close"></dm5-search-widget>
  </div>
</template>

<script>
export default {

  computed: {

    visible () {
      return this.$store.state.search.visible
    },

    menuTopicTypes () {
      console.log('menuTopicTypes', this.$store.getters.menuTopicTypes)
      return this.$store.getters.menuTopicTypes
    }
  },

  methods: {

    handle (command) {
      if (command) {
        this.$store.dispatch(command)
      }
    },

    close () {
      this.$store.dispatch('closeSearchWidget')
    }
  },

  components: {
    'dm5-search-widget': require('dm5-search-widget').default
  }
}
</script>
