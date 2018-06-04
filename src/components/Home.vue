<template>
  <div class="home">
    <div class="input-wrapper">
      <input type="text" v-model="text" @keyup.enter="say" autofocus placeholder="输入让若琪说的话">
    </div>
  </div>
</template>

<script>
export default {
  name: 'Network',
  data () {
    return {
      text: ''
    }
  },
  methods: {
    say () {
      if (this.text) {
        this.text = ''
        this.axios.get('/apis/media/say?text=' + this.text)
        .then((result) => {
          if (result.data.status === 'complete') {
            // nothing to do
          }
        }).catch((error) => {
          try {
            this.$alert(error.response.data.message || '网络错误', '提示')
          } catch (error) {
            this.$alert('网络错误', '提示')
          }
        })
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.home .input-wrapper{
  margin-top: 30px;
  display: flex;
}
.home .input-wrapper input {
  flex: 1;
  height: 40px;
  font-size: 26px;
  text-align: center;
  outline: none;
  border: none;
  border-bottom: 1px solid #f6f6f6;
}
</style>
