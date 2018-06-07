<template>
  <div class="home">
    <div class="motion">
      <div class="motion-speech">
        <p class="nlp-result">{{speech.nlp || '我在听'}}</p>
        <p v-show="speech.asr.length > 0" class="asr-result">{{speech.asr}}</p>
        <div class="mic" :class="{ active: speech.accept }"></div>
      </div>

    </div>
    <div class="input-wrapper">
      <input type="text" v-model="text" @keyup.enter="say" autofocus placeholder="输入让若琪说的话或音频URL">
    </div>

  </div>
</template>

<script>
import 'event-source-polyfill'

export default {
  name: 'Network',
  data () {
    return {
      text: '',
      speech: {
        accept: false,
        voiceHandle: -1,
        asr: '',
        nlp: ''
      }
    }
  },
  methods: {
    say () {
      if (/^https?:\/\/|www\./.test(this.text)) {
        this.axios.get('/apis/media/play?url=' + this.text)
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
      } else if (this.text) {
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
      this.text = ''
    }
  },
  mounted () {
    var speechSSE = new EventSource('http://10.88.8.199/apis/sse/speech')

    speechSSE.addEventListener('speech', (event) => {
      var data = JSON.parse(event.data || '{}')
      this.speech.asr = data.asr || ''
    })
    speechSSE.addEventListener('tts-start', (event) => {
      var data = JSON.parse(event.data || '{}')
      var tts = data.tts || ''
      tts = tts.replace(/<silence=\d+><\/silence>/g, '')
      this.speech.nlp = tts
      // 当返回NLP的时候关闭激活状态
      this.speech.accept = false
    })
    speechSSE.addEventListener('voice-accept', (event) => {
      this.speech.accept = true
      clearTimeout(this.speech.voiceHandle)
      this.speech.voiceHandle = setTimeout(() => {
        this.speech.accept = false
      }, 6000)
    })
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
p {
  margin: 0;
}
.flex {
  display: flex;
}
.flex-1 {
  flex: 1;
}
.flex-content-center {
  justify-content: center;
}
.flex-content-around {
  justify-content: space-around;
}
.flex-items-center {
  align-items: center;
}
.margin-top-20 {
  margin-top: 20px;
}
.margin-left-20 {
  margin-left: 20px;
}
.margin-right-20 {
  margin-right: 20px;
}
</style>

<style scoped>
.motion {
  height: 300px;
  background-color: #f6f6f6;
  border-radius: 10px;
  padding: 16px;
}
.motion .motion-media {
  height: 100%;
  display: none;
}
.motion .motion-media .title {
  text-align: center;
  font-size: 16px;
  font-weight: 500;
}

.motion .motion-speech {
  position: relative;
  height: 100%;
}
.motion .motion-speech .nlp-result {
  font-size: 30px;
  text-align: center;
}
/* asr识别结果 */
.motion .motion-speech .asr-result {
  position: absolute;
  min-width: 60px;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 14px;
  text-align: center;
  color: white;
  line-height: 30px;
  padding: 0 10px;
  background: linear-gradient(#8bd3e8, #63aec3);
  border-radius: 20px;
  border: 2px solid white;
  box-shadow: 1px 1px 5px #ccc;
}
.motion .motion-speech .asr-result::before {
  content: "";
  position: absolute;
  width: 0;
  height: 0;
  left: 50%;
  bottom: -30px;
  margin-left: -15px;
  border: 15px solid transparent;
  border-top-color: white;
}
.motion .motion-speech .asr-result::after {
  content: "";
  position: absolute;
  width: 0;
  height: 0;
  left: 50%;
  bottom: -24px;
  margin-left: -12px;
  border: 12px solid transparent;
  border-top-color: #63aec3;
}
.motion .motion-speech .mic {
  position: absolute;
  bottom: -33px;
  left: 50%;
  width: 36px;
  height: 36px;
  border-radius: 40px;
  transform: translateX(-50%);
  box-shadow: 0px 3px 6px #aaa;
  transition: 0.3s;
}
.motion .motion-speech .mic::before {
  position: absolute;
  content: '';
  width: 100%;
  height: 100%;
  background-image: url('../assets/mic.png');
  background-size: 100%;
  opacity: 0.8;
}

.motion .motion-speech .mic.active {
  background-color: #68c5df;
}

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
  border-bottom: 2px solid #f6f6f6;
  transition: 0.3s;
}
.home .input-wrapper input:focus {
  border-bottom: 2px solid #68c5df;
}

.rokid-app-mgr .title {
  padding: 20px 0;
}
.rokid-app-mgr .app-list {
  border: 2px solid #f6f6f6;
  padding: 5px;
  border-radius: 5px;
}
.rokid-app-mgr .app-list .app {
  background-color: #68c5df;
  padding: 5px;
  border-radius: 5px;
  color: white;
}


.home .system-info .system-chart {
  width: 400px;
  height: 260px;
}
</style>
