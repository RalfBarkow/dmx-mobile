<template>
  <el-dropdown class="dm5-main-menu" size="medium" trigger="click" @command="handle">
    <span class="fa fa-bars"></span>
    <el-dropdown-menu slot="dropdown">
      <el-dropdown-item command="openSearchWidget">{{searchLabel}}</el-dropdown-item>
      <el-dropdown-item v-if="!username" command="openLoginDialog" divided>Login</el-dropdown-item>
      <el-dropdown-item v-else command="logout" divided>Logout "{{username}}"</el-dropdown-item>
    </el-dropdown-menu>
  </el-dropdown>
</template>

<script>
export default {

  computed: {

    username () {
      return this.$store.state.login.username
    },

    searchLabel () {
      return this.username ? 'Search / Create' : 'Search'
    }
  },

  methods: {
    handle (command) {
      this.$store.dispatch(command)
    }
  }
}
</script>

<style>
.dm5-main-menu {
  position: absolute !important;
  top: 6px;
  right: 6px;
  z-index: 1;
  font-size: 18px !important;
  color: var(--label-color) !important;
}
</style>
