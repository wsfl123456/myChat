<template>
  <div class='arrow' :style="{ 'background': arrow === 1 ? '#67C23A' : '#E6A23C' }">
      {{ msg }}
      <div :class="{ 'arrow_right': arrow === 1, 'arrow_left': arrow === 0  }"></div>
  </div>
</template>
<script lang='ts'>
import './index.less'
import { Component, Vue, Prop } from 'vue-property-decorator'

@Component
export default class Arrow extends Vue {
  @Prop(String) readonly msg!: string
  @Prop(Number) readonly arrow!: number
}
</script>
