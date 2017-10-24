<template>
  <header id="rokid-header">
    <ul>
      <li class="logo"><h1>RokidOS</h1></li>
      <li>
        <router-link to="/">首页</router-link>
      </li>
      <!-- <li>
        <router-link to="/network">网络</router-link>
      </li> -->
      <li>
        <router-link to="/upgrade">系统升级</router-link>
      </li>
      <li><a target="_blank" href="https://rokid.github.io/rokidos-linux-docs/">文档</a></li>
    </ul>
  </header>
</template>

<script>
export default {
  name: 'Header',
  data () {
    return {
      msg: 'Welcome to Your Vue.js App'
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
#rokid-header {
  background: rgba(0, 176, 213, .1);
}
#rokid-header ul {
  width: 80%;
  margin: auto;
  text-align: left;
}
#rokid-header li {
  display: inline-block;
}
#rokid-header .logo {
  color: rgba(0, 176, 213, .7);
  margin-right: 50px;
}
#rokid-header li > a {
  transition: all .3s;
  display: inline-block;
  text-align: center;
  text-decoration: none;
  color: #474747;
  padding: 0 20px;
}
#rokid-header li > a:hover {
  color: rgba(0, 176, 213, .7);
}
</style>
