<!--
 * Copyright (c) 2013-Now http://jeesite.com All rights reserved.
 * No deletion without permission, or be held responsible to law.
 * @author gujimeng
-->
<template>
  <div style="width: 100%;height: 100%;">
    <div id="container" style="width: 100%;height: 100%;"></div>
  </div>
</template>
<script lang="ts">
  import { defineComponent, onMounted, ref } from 'vue';
  import { toNodes } from './graph_x6.ts';
  export default defineComponent({
    name: 'ViewsFamilyFamilyGraphGraph',
  });
</script>
<script lang="ts" setup>
import { Graph } from '@antv/x6';
import { FamilyMember, familyMemberListData } from '/@/api/family/familyMember';

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
  let nodes = toNodes(dataArray.value, {
    key: "id",
    parentKey: "father",
    children: "children"
  })
  const graph = new Graph({
    container: document.getElementById('container') as HTMLElement,
    background: {
      color: '#fffbe6', // 设置画布背景颜色
    },
    grid: {
      size: 10,      // 网格大小 10px
      visible: true, // 渲染网格背景
    },
  });
  graph.fromJSON({
    nodes,
    edges: []
  })
})
</script>