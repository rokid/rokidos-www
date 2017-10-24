<template>
  <div class="upgrade">
    <div class="upgrade-zone">
      <file-upload
        class="upgrade-upload-btn"
        ref="upload"
        :post-action="postAction"
        :extensions="extensions"
        :drop="drop"
        :headers="headers"
        v-model="files"
        @input-file="onInputFile">
        <div>选择你要升级的镜像并上传</div>
      </file-upload>
    </div>
    <div class="upgrade-confirm">
      <div class="upgrade-confirm-btn disabled">
        <div class="upgrade-confirm-background" 
          :style="{width: (files.length > 0 ? files[0].progress : '0') + '%'}"></div>
        开始升级
      </div>
    </div>
  </div>
</template>

<script>
import Upload from 'vue-upload-component'
export default {
  name: 'Upgrade',
  data: function () {
    return {
      files: [],
      extensions: 'img',
      drop: true,
      name: 'file',
      postAction: 'http://10.88.8.96/upgrade/upload-image',
      headers: {
        'X-Csrf-Token': 'xxxx'
      }
    }
  },
  components: {
    'file-upload': Upload
  },
  methods: {
    onInputFile (newfile, oldfile) {
      let target
      if (!oldfile && newfile) {
        target = newfile
      } else if (oldfile && newfile) {
        target = newfile
      }
      if (target && !this.$refs.upload.active) {
        this.$refs.upload.active = true
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.upgrade {
  padding-top: 10%;
}
.upgrade-zone {
  display: flex;
  justify-content: center;
}
.upgrade-upload-btn {
  display: flex;
  height: 120px;
  width: 350px;
  border: 2px dashed #999;
  border-radius: 5px;
  box-sizing: border-box;
  color: #999;
  justify-content: center;
  flex-direction: column;
  cursor: pointer;
  transition: all .5s;
}
.upgrade-upload-btn:hover {
  border-color: #333;
  color: #333;
}
.upgrade-confirm {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
.upgrade-confirm-background {
  position: absolute;
  z-index: -1;
  top: 0;
  left: 0;
  height: 100%;
  background-color: rgba(0, 176, 213, 1);
}
.upgrade-confirm-btn {
  overflow: hidden;
  position: relative;
  display: inline-block;
  height: 50px;
  width: 350px;
  line-height: 50px;
  background: rgba(0, 176, 213, .2);
  border-radius: 5px;
  color: #fff;
  text-decoration: none;
  text-align: center;
  transition: all .2s;
  vertical-align: middle;
  cursor: pointer;
}

</style>
