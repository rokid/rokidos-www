<template>
  <el-container>
    <!-- <el-aside>
      
    </el-aside> -->
    <el-main>
      <div class="upgrade-list">
        <div class="title">
          <span>镜像列表</span>
          <span class="update-time">列表更新时间: {{listUpdateTime}}</span>
          <file-upload
            class="upgrade-upload-btn"
            ref="upload"
            :put-action="postAction"
            :extensions="extensions"
            :drop="drop"
            :headers="headers"
            v-model="files"
            @input-file="onInputFile"
            @input-filter="filterFile">
            <div class="upload-btn" title="选择本地镜像上传到设备">上传镜像</div>
          </file-upload>
        </div>
        <transition-group name="list" tag="ul" class="list">
          <li v-for="img in imgList" v-bind:key="img.buildId + img.datetime + img.version" class="item" :class="{ open: img.show }">
            <div class="preview">
              <div class="info" :title="`点击${img.show?'关闭':'展开'}详细信息`" @click="img.show = !img.show">
                <p class="name">{{img.category || 'unknow'}}</p>
                <p class="other">
                  <span class="version">版本：{{img.version}}</span>
                  <span class="date">日期：{{img.datetime}}</span>
                </p>
              </div>
              <div class="download" @click="downloadImgByURL(img.imageUri.upgrade)" title="下载此升级镜像到设备">下载</div>
            </div>
            <div class="change-log">
              <p>升级镜像：<a :href="img.imageUri.upgrade">{{img.imageUri.upgrade}}</a></p>
              <p>刷机镜像：<a :href="img.imageUri.flush">{{img.imageUri.flush}}</a></p>
              <br />
              <p>更新日志：</p>
              <div v-html="markdown(img.readme)"></div>
            </div>
          </li>
        </transition-group>
        <el-alert v-if="notice.show" :title="notice.title" :type="notice.type" :closable="false" center>
          <i v-if="notice.loading" class="notice-loading el-icon-loading"></i>
        </el-alert>
      </div>

      <!-- 用户手动上传镜像提示 -->
      <div class="upload-progress" v-if="uploadView.show">
        <div class="content">
          <el-progress class="my-el-progress" type="circle"
            :status="uploadStatus.status"
            :percentage="uploadStatus.percent">
          </el-progress>
          <p><el-button type="primary" @click="startUpdate"
            :loading="uploadStatus.loading">
            {{uploadStatus.text}}
          </el-button></p>
        </div>
      </div>
    </el-main>
  </el-container>
</template>

<script>
import Upload from 'vue-upload-component'
import {markdown} from 'markdown'

export default {
  name: 'Upgrade',
  data () {
    return {
      listUpdateTime: '',
      imgList: [],
      notice: {
        loading: true,
        show: true,
        type: 'info',
        title: '正在加载'
      },
      uploadView: {
        downloadStep: '',
        downloadPercent: 0,
        updateStep: '',
        updatePercent: 0,
        show: false
      },
      target: null,
      files: [],
      extensions: 'img',
      drop: true,
      name: 'file',
      postAction: '/apis/image/upload',
      headers: {
        'X-Csrf-Token': 'xxxx'
      }
    }
  },
  computed: {
    uploadStatus: function () {
      /**
       * 根据上传和下载的进度显示progress。上传和下载共用
       * depend：
       *     downloadStep: 下载进度，取值为: downloading, downloaded, updating, complete, error
       *     updateStep: 上传进度, 取值为: '', error, updating, complete
       *     files: 上传文件列表
       * downloadStep优先级高
       */
      var res = {
        status: '',
        percent: 0,
        loading: true,
        text: '镜像上传中'
      }
      if (this.uploadView.downloadStep === 'downloading') {
        res.percent = this.uploadView.downloadPercent
        res.text = '下载镜像中'
      } else if (this.uploadView.downloadStep === 'downloaded') {
        res.status = 'success'
        res.percent = 100
        res.loading = false
        res.text = '开始更新系统'
      } else if (this.uploadView.downloadStep === 'updating') {
        res.status = 'success'
        res.percent = this.uploadView.updatePercent
        res.loading = true
        res.text = '系统更新中'
      } else if (this.uploadView.downloadStep === 'complete') {
        res.status = 'success'
        res.percent = 100
        res.loading = false
        res.text = '系统更新完成'
      } else if (this.uploadView.downloadStep === 'error') {
        res.status = 'error'
        res.loading = false
        res.text = '重新下载镜像'
      } else if (this.uploadView.updateStep === 'error') {
        res.status = 'error'
        res.loading = false
        res.text = '重新选择镜像'
      } else if (this.files.length > 0) {
        res.status = this.files[0].success ? 'success' : ''
        res.percent = +this.files[0].progress || 0
        res.loading = !this.files[0].success
        // 上传失败
        if (!this.files[0].success && this.files[0].error) {
          // tips: 在下一帧中清除掉文件，否则computed会无限触发
          this.$nextTick(() => {
            this.$refs.upload.clear()
          })
          this.$alert('镜像上传失败，错误代码是：' + this.files[0].error, '错误', {
            type: 'error',
            callback: (action) => {
              this.uploadView.updateStep = 'error'
            }
          })
        } else if (this.files[0].success && this.uploadView.updateStep === 'updating') {
          res.text = '系统更新中'
          res.loading = true
        } else if (this.files[0].success && this.uploadView.updateStep === 'complete') {
          res.text = '系统更新完成'
          res.loading = false
        } else if (this.files[0].success) {
          res.text = '开始更新系统'
        }
      } else {
        res.text = '请选择镜像'
      }
      return res
    }
  },
  components: {
    'file-upload': Upload
  },
  methods: {
    filterFile (newfile, oldfile, prevent) {
      // 限制一下文件名，TODO：通过校验文件类型
      if (newfile && newfile.name !== 'rokid_upgrade_package.img') {
        this.$alert('请上传 rokid_upgrade_package.img', '提示')
        return prevent()
      }
    },
    onInputFile (newfile, oldfile) {
      // 开始上传镜像并显示进度
      this.uploadView.show = true
      this.$refs.upload.active = true
    },
    checkAlive () {
      this.uploadView.updatePercent++
      if (this.uploadView.updatePercent >= 99) {
        this.uploadView.updatePercent = 99
      }
      this.$http.get('/apis/ping', {timeout: 1000}).then(() => {
        // 更新完成
        this.uploadView.updateStep = 'complete'
        this.uploadView.downloadStep = 'complete'
      }, () => {
        // 降低更新频率
        setTimeout(() => {
          this.checkAlive()
        }, 1000)
      })
    },
    startUpdate () {
      // 判断当前按钮的操作
      // 系统更新完成
      if (this.uploadView.downloadStep === 'complete' || this.uploadView.updateStep === 'complete') {
        // 清空上传文件，可以不用刷新页面，体验优化
        this.$refs.upload.clear()
        this.uploadView.updateStep = ''
        this.uploadView.downloadStep = ''
        this.uploadView.downloadPercent = 0
        this.uploadView.show = false
      // 下载镜像或上传镜像失败
      } else if (this.uploadView.downloadStep === 'error' || this.uploadView.updateStep === 'error') {
        this.uploadView.updateStep = ''
        this.uploadView.downloadStep = ''
        this.uploadView.show = false
      // 当前按钮的操作是开始更新
      } else {
        this.$confirm('升级过程中切勿关闭电源，是否继续？', '警告', {
          type: 'warning'
        }).then(() => {
          // 开始更新系统
          this.axios.patch('/apis/image/upgrade')
          .then((response) => {
            this.uploadView.downloadStep = 'updating'
            setTimeout(() => {
              this.checkAlive()
            }, response.data.delay || 3000)
          }).catch(() => {
            this.$alert('网络错误，请重试')
          })
        }).catch(() => {
          // do nothing
        })
      }
    },
    downloadImgByURL (url) {
      // 模拟下载进度
      // TODO：真实的下载进度
      var handle
      var percent = 0
      this.uploadView.downloadStep = 'downloading'
      handle = setInterval(() => {
        percent += 10
        if (percent >= 99) {
          percent = 99
        }
        this.uploadView.downloadPercent = percent
      }, 1000)
      this.uploadView.show = true
      this.axios.get('/apis/image/download?image_url=' + url)
      .then((response) => {
        clearInterval(handle)
        this.uploadView.downloadStep = 'downloaded'
      }).catch((error) => {
        clearInterval(handle)
        this.uploadView.downloadStep = 'error'
        if (error.response.data && error.response.data.message) {
          this.$alert(error.response.data.message, '下载错误')
        } else {
          this.$alert('未知的网络错误', '下载错误')
        }
      })
    },
    markdown (md) {
      var mark = md.replace(/<!--\S*-->/gi, '')
      return markdown.toHTML(mark)
    }
  },
  mounted () {
    this.axios.get('https://cors.io/?https://rokid.github.io/release/rokidos.json')
    .then((response) => {
      var data = response.data || {}
      var android = data.android || []
      var linux = data.linux || []
      // 格式化对象。增加属性，让属性可observable
      this.imgList = linux.concat(android).map((img) => {
        img.show = false
        img.datetime = img.datetime.substring(0, 4) + '-' + img.datetime.substring(4, 6) + '-' + img.datetime.substring(6)
        return img
      })
      this.listUpdateTime = data.date.substring(0, 19).replace('T', ' ')
      if (this.imgList.length <= 0) {
        this.notice.loading = false
        this.notice.show = true
        this.notice.type = 'success'
        this.notice.title = '没有可以升级的镜像'
      } else {
        this.notice.show = false
      }
    })
    .catch((error) => {
      this.notice.loading = false
      this.notice.show = true
      this.notice.type = 'error'
      this.notice.title = '镜像列表加载错误：' + error.message
    })
  }
}
</script>

<style>
.upgrade-list .list .item .change-log ul {
  padding-left: 20px;
}
</style>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
p {
  padding: 0;
  margin: 0;
  border: 0;
}
ul {
  list-style-type: none;
}

.upgrade-list {
  margin-top: 10px;
}
.upgrade-list .title {
  position: relative;
  height: 60px;
  display: flex;
  align-items: center;
  background-color: #68c5df;
  color: #fff;
  font-size: 20px;
  font-weight: 700;
  padding: 0 20px;
  padding-right: 117px;
  border-radius: 5px 5px 0 0;
}
.upgrade-list .title > span {
  flex: 1;
}
.upgrade-list .title .update-time {
  font-size: 14px;
}
.upgrade-list .title .upgrade-upload-btn {
  position: absolute;
  right: 17px;
}
.upgrade-list .title .upload-btn {
  font-size: 12px;
  font-weight: 700;
  padding: 8px 15px;
  color: #fff;
  border-radius: 20px;
  cursor: pointer;
  border: 2px solid #fff;
}

.upgrade-list .list .item {
  position: relative;
  transition: all 0.3s;
  height: 60px;
  margin-top: 4px;
  position: relative;
  overflow: hidden;
}
/**
 * 添加 .open 展开列表
 */
.upgrade-list .list .item.open {
  height: 300px;
}
.upgrade-list .list .item .preview {
  display: flex;
  cursor: pointer;
  transition: background-color 0.3s;
}
.upgrade-list .list .item .preview:hover {
  background-color: #68c5df;
}
.upgrade-list .list .item .preview .info {
  position: relative;
  display: flex;
  flex: 1;
  height: 60px;
  align-items: center;
  padding-left: 20px;
  background-color: rgba(245, 245, 245, 0.9);
}
.upgrade-list .info .name {
  flex: 1;
  font-size: 20px;
  font-weight: 700;
}
.upgrade-list .info .other {
  flex: 1;
  font-size: 14px;
}
.upgrade-list .info .other .date {
  margin-left: 12px;
}
.upgrade-list .list .item .preview .download {
  display: flex;
  width: 115px;
  height: 60px;
  align-items: center;
  justify-content: center;
  margin-left: 2px;
  background-color: rgba(245, 245, 245, 0.9);
}
.upgrade-list .list .item .change-log {
  position: absolute;
  box-sizing: border-box;
  top: 60px;
  width: 100%;
  height: 240px;
  overflow-y: auto;
  padding: 15px;
  border: 5px solid rgba(245, 245, 245, 0.9);
  border-top: none;
  border-radius: 0 0 5px 5px;
  word-break: break-all;
}


.notice-loading {
  margin-left: 5px;
}

.upload-progress {
  position: fixed;
  /* background-color: rgba(0, 0, 0, 0.8); */
  left: 0px;
  right: 0px;
  top: 0px;
  bottom: 0px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.7);
}

.upload-progress .content {
  position: relative;
  text-align: center;
  color: #fff;
}
.upload-progress .content p {
  margin-top: 10px;
}

.list-enter-active, .list-leave-active {
  transition: all 0.3s;
}
.list-enter, .list-leave-to
/* .list-leave-active for below version 2.1.8 */ {
  opacity: 0;
  transform: translateY(30px);
}
</style>

<style>
.my-el-progress .el-progress__text {
  color: #fff;
}
</style>
