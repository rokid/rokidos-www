<template>
  <div id="app">
    <rokid-header />
    <section id="page-wrapper">
      <router-view />
    </section>
  </div>
</template>

<script>
import Header from '@/components/Header'

export default {
  name: 'app',
  components: {
    'rokid-header': Header
  }
}
</script>

<style>

body, ul {
  margin: 0;
  padding: 0;
}
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 0px;
}
#page-wrapper {
  text-align: left;
  padding: 10px 10%;
  box-sizing: border-box;
}
</style>
