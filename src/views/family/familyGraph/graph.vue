<!--
 * Copyright (c) 2013-Now http://jeesite.com All rights reserved.
 * No deletion without permission, or be held responsible to law.
 * @author gujimeng
-->
<template>
  <div class="graph-main" style="width: 100%;height: 100%;">
    <div id="container" style="width: 100%;height: 100%;"></div>
    <div class="graph-toolbar">
      <a-button class="toolbar-btn" :ghost="true">
        <Icon icon="ant-design:zoom-in-outlined" @click="zoomIn"></Icon>
      </a-button>
      <a-button class="toolbar-btn" :ghost="true">
        <Icon icon="ant-design:zoom-out-outlined"></Icon>
      </a-button>
    </div>
  </div>
</template>
<script lang="ts">
import { Icon } from '/@/components/Icon';
import { defineComponent, onMounted, ref } from 'vue';
export default defineComponent({
  name: 'ViewsFamilyFamilyGraphGraph',
  components: { Icon }
});
</script>
<script lang="ts" setup>
import { Graph } from '@antv/x6';
import { FamilyMember, familyMemberListData } from '/@/api/family/familyMember';
import { crateNodeEdge, registerNode } from './graph_x6';

const graph = ref<Graph>()

registerNode()

const dataArray = ref<Array<FamilyMember>>([])

const refresh = () => {
  return new Promise<void>((resolve) => {
    familyMemberListData().then(res => {
      dataArray.value = res.list
      resolve()
    })
  })
}

onMounted(async () => {
  await refresh()
  graph.value = new Graph({
    container: document.getElementById('container') as HTMLElement,
    background: {
      color: '#fcfcfc', // 设置画布背景颜色
    },
    grid: {
      size: 1,      // 网格大小 10px
    },
    // 节点和边的交互行为
    interacting: {
      // 节点不可移动
      nodeMovable: false,
      // 边不可移动
      edgeMovable: false,
    },
    // 画布拖动
    panning: true,
    // 滚动
    scroller: false,
    // 缩放
    mousewheel: true
  });
  crateNodeEdge(graph.value, dataArray.value, {
    key: "id",
    parentKey: 'father',
    children: 'children'
  })
})
const zoomIn = () => graph.value && graph.value.zoomTo(2)
</script>
<style scoped lang="less">
.graph-main{
  position: relative;
  .graph-toolbar{
    position: absolute;
    left: 0;
    top: 0;
    background: rgba(0, 0, 0, 0);
    .toolbar-btn{
      color: rgba(68, 55, 217, 0.6);
      border: 1px solid rgba(68, 55, 217, .6);
      margin-left: 10px;
      margin-top: 10px;
      border-radius: 5px;
    }
  }
}
</style>