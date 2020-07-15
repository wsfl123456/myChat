<template>
  <div class='edit-info'>
     <el-form label-width="80px">
       <el-form-item>
              <span slot="label">
                头像
              </span>
              <div class="picture-upload">
                <el-upload
                  v-if="!params.picture"
                  action="/upload"
                  name='logo'
                  :show-file-list="false"
                  :before-upload="handleBeforeUpload"
                  :on-success="(response, file, fileList) => handleSuccess(file)"
                  :on-error="handleError"
                >
                  <i slot="default" class="el-icon-plus icon"></i>
                </el-upload>

                <div v-if="params.picture" class="upload-view">
                  <el-image style="height:80px;width:80px" :src="params.picture" fit="cover"></el-image>
                  <div class="operate">
                    <i class="el-icon-view pointer" @click="() => { this.dialogVisible = true }"></i>
                    <i class="el-icon-delete pointer" @click="() => { this.params.picture = '' }"></i>
                  </div>
                </div>
              </div>
            </el-form-item>
       <el-form-item label="昵称" required>
         <el-input v-model="params.nickname"></el-input>
       </el-form-item>
       <el-form-item label="性别">
         <el-radio-group v-model="params.sex">
           <el-radio label="男">男</el-radio>
           <el-radio label="女">女</el-radio>
         </el-radio-group>
       </el-form-item>
       <el-form-item label="个性签名">
         <el-input v-model="params.signature"></el-input>
       </el-form-item>
       <el-form-item label="地区">
         <el-input v-model="params.address"></el-input>
       </el-form-item>
     </el-form>

      <div class="edit-info_btn-group">
        <el-button type="danger" @click="cancel">取消</el-button>
        <el-button type="primary" @click="editSubmit">提交</el-button>
      </div>

    <el-dialog :visible.sync="dialogVisible">
      <img width="100%" :src="this.params.picture" alt />
    </el-dialog>
  </div>
</template>
<script lang='ts'>
import './index.less'
import { Component, Vue, Watch } from 'vue-property-decorator'
import { Message, MessageBox } from 'element-ui'
import { getCookie } from '../../util/index'
import Network from '../../network'
import { UserInfo, EditUserInfoRes } from '../../interface'
import Avator from '../../components/Avatar/index.vue'
import Arrow from '../../components/Arrow/index.vue'

interface ParamsInfo {
  nickname: string;
  sex: string;
  picture: string;
  signature: string;
  address: string;
}

@Component
export default class EditInfo extends Vue {
  dialogVisible = false
  params: ParamsInfo = {
    nickname: '',
    sex: '',
    picture: '',
    signature: '',
    address: ''
  }

  getParams () {
    this.params.nickname = getCookie().nickname
    this.params.sex = getCookie().sex
    this.params.picture = getCookie().picture
    this.params.signature = getCookie().signature
    this.params.address = getCookie().address
  }

  handleBeforeUpload (file: any): boolean {
    if (file.type !== 'image/jpeg' && file.type !== 'image/png') {
      MessageBox.confirm(
        `<div class="upload-error-wrapper">
        <span class="upload-fail-img"></span>
        <p class="error-msg">很抱歉，仅支持上传PNG、JPEG格式图片</p>
        <p class="error-msg">您可以重新上传</p>
      </div>`,
        {
          dangerouslyUseHTMLString: true
        }
      )

      return false
    }
    if (file.size > 1024 * 1000 * 5) {
      MessageBox.confirm(
        `<div class="upload-error-wrapper">
        <span class="upload-fail-img"></span>
        <p class="error-msg">很抱歉，图片超过5MB</p>
        <p class="error-msg">您可以重新上传</p>
      </div>`,
        {
          dangerouslyUseHTMLString: true
        }
      )

      return false
    }
    return true
  }

  handleSuccess (file: any) {
    this.params.picture = file.response.retData.path
    Message.success('上传成功')
  }

  handleError () {
    Message.error('上传失败')
  }

  async cancel () {
    this.$router.push({
      name: 'Index'
    })
  }

  async editSubmit () {
    if (!this.params.nickname) {
      Message.warning('请填写昵称')
      return
    }
    if (this.params.nickname.length > 6) {
      Message.warning('昵称过长')
      return
    }
    const editUserInfoRes = await Network.fetch<EditUserInfoRes>('EditUserInfo', this.params)
    if (editUserInfoRes.data.retCode === 100) {
      Message.success(editUserInfoRes.data.retMsg)
      this.$store.dispatch('SetMsgArr', getCookie().id)
      this.$store.commit('refreshInfo', true)
      this.cancel()
    }
  }

  created () {
    this.getParams()
  }
}
</script>
