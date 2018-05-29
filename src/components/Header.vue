<template>
  <header id="rokid-header">
    <ul>
      <li class="logo">
        <router-link to="/">RokidOS</router-link>
      </li>
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
  background: #f6f6f6;
}
#rokid-header ul {
  width: 80%;
  margin: auto;
  text-align: left;
  display: flex;
}
#rokid-header li {
  display: flex;
}
#rokid-header li > a {
  display: flex;
  height: 80px;
  padding: 0 20px;
  justify-content: center;
  align-items: center;
  transition: all .3s;
  text-align: center;
  text-decoration: none;
  color: #2c3e50;
  font-size: 16px;
}
#rokid-header li > a:hover {
  background-color: #68c5df;
  color: #fff;
}
#rokid-header .logo > a{
  font-size: 30px;
  font-weight: 700;
  color: #68c5df;
  margin-right: 50px;
}
#rokid-header .logo > a:hover {
  background-color: inherit;
  color: #68c5df;
  transform: scale(1.3);
}
</style>
