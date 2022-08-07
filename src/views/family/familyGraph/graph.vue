<!--
 * Copyright (c) 2013-Now http://jeesite.com All rights reserved.
 * No deletion without permission, or be held responsible to law.
 * @author gujimeng
-->
<template>
  <div ref="graphMainRef" class="graph-main" style="width: 100%;height: 100%;">
    <!-- 画布 -->
    <div id="container" style="width: 100%;height: 100%;"></div>
    <!-- 顶部工具栏 -->
    <div class="graph-toolbar">
      <a-button class="toolbar-btn" :ghost="true" @click="zoomIn">
        <Icon icon="ant-design:zoom-in-outlined"></Icon>
      </a-button>
      <a-button class="toolbar-btn" :ghost="true" @click="zoomOut">
        <Icon icon="ant-design:zoom-out-outlined"></Icon>
      </a-button>
      <Divider type="vertical" class="toolbar-divider"/>
      <a-button class="toolbar-btn" :ghost="true" @click="refresh">
        <Icon icon="ant-design:redo-outlined"></Icon>
      </a-button>
      <a-button class="toolbar-btn" :ghost="true" @click="centerMe">
        <Icon icon="focus|svg"></Icon>
      </a-button>
      <Divider type="vertical" class="toolbar-divider"/>
    </div>
    <!-- 小地图 -->
    <div id="miniMapContainer">

    </div>
  </div>
</template>
<script lang="ts">
import { Icon } from '/@/components/Icon';
import { defineComponent, onMounted, ref } from 'vue';
import { Divider, Spin } from 'ant-design-vue';
import { useLoading } from '/@/components/Loading';
export default defineComponent({
  name: 'ViewsFamilyFamilyGraphGraph',
  components: { Icon, Divider, Spin }
});
</script>
<script lang="ts" setup>
import { familyMemberListData } from '/@/api/family/familyMember';
import { registerNode, FamilyMemberGraph } from './graph_x6';
const graphMainRef = ref()
const [openWrapLoading, closeWrapLoading] = useLoading({
        target: graphMainRef,
        props: {
          tip: '正在加载数据...',
          absolute: true,
        },
      });
const graph = ref<FamilyMemberGraph>()
registerNode()

const refresh = () => {
  openWrapLoading()
  graph.value?.dispose()
  familyMemberListData().then(res => {
    let elem = document.getElementById("container")
    let miniElem = document.getElementById("miniMapContainer")
    if(elem && miniElem){
      graph.value = new FamilyMemberGraph(
        elem,
        res.list,
        {
          key: "id",
          parentKey: 'father',
          children: 'children'
        },
        undefined,
        {
          // minimap: {
          //   enabled: true,
          //   container: miniElem,
          //   width: 300,
          //   height: 200,
          // }
        }
      )
    }
  }).finally(() => closeWrapLoading())
}

onMounted(async () => {
  refresh()
})
const zoomIn = () => graph.value && graph.value.zoom(0.2)
const zoomOut = () => graph.value && graph.value.zoom(-0.2)
const centerMe = () => {
  if(graph.value?.getMe()){ 
    graph.value && graph.value.centerCell(graph.value.getCellById(graph.value?.getMe().id))
  }
}
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
    .toolbar-divider{
      background: rgba(68, 55, 217, 0.6);
      height: 1.8em;
      margin-right: 0px;
    }
  }
  #miniMapContainer{
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 1;
    background: rgba(128, 128, 128, 1);
  }
}
</style>