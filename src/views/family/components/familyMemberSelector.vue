<template>
  <InputGroup compact>
    <Input :value="memberDisplay" allow-clear @change="valueChange">
      <template #addonAfter>
        <TeamOutlined class="cursor-pointer py-1" @click="visible=true"/>
      </template>
    </Input>
    <Modal v-model:visible="visible" title="选择成员" width="50%">
      <BasicTable @register="registerTable" @row-click="handleMemberSelected" @fetch-success="fetchMemberListSuccess"></BasicTable>
    </Modal>
  </InputGroup>
</template>
<script lang="ts">
  import { InputGroup, Tooltip, Button, Input, Modal } from 'ant-design-vue';
  import { BasicTable, BasicColumn, useTable } from '/@/components/Table';
  import { TeamOutlined } from '@ant-design/icons-vue'
  import { useI18n } from '/@/hooks/web/useI18n';
  export default defineComponent({
    components: { InputGroup, Tooltip, Button, Input, TeamOutlined, Modal, BasicTable },
    name: 'ViewsFamilyComponentsFamilyMemberSelector',
  });
</script>
<script lang="ts" setup>
import { computed, defineComponent, ref } from 'vue';
import { FamilyMember, familyMemberListData } from '/@/api/family/familyMember';
  import { useRuleFormItem } from '/@/hooks/component/useFormItem';
const props = defineProps({
  value: {
    type: String,
    require: true
  }
})
const { t } = useI18n('family.familyMember');
const [state] = useRuleFormItem(props);
const visible = ref(false);

// 所有用户
const memberList = ref<Array<FamilyMember>>([] as Array<FamilyMember>)

familyMemberListData().then(res => {
  memberList.value = res.list
})

// 表格
const tableColumns: BasicColumn[] = [
  {
    title: t('姓名'),
    dataIndex: 'name',
    key: 'a.name',
    sorter: true,
    align: 'left',
    slots: { customRender: 'firstColumn' },
  },
  {
    title: t('成员性别'),
    dataIndex: 'sex',
    key: 'a.sex',
    sorter: true,
    align: 'center',
    dictType: 'sys_user_sex',
  },
  {
    title: t('出生日期'),
    dataIndex: 'birthday',
    key: 'a.birthday',
    sorter: true,
    align: 'center',
  },
  {
    title: t('已婚'),
    dataIndex: 'marriage',
    key: 'a.marriage',
    sorter: true,
    align: 'center',
    dictType: 'sys_yes_no',
  },
];
const [registerTable, { reload }] = useTable({
  api: familyMemberListData,
  // dataSource: memberList.value,
  beforeFetch: (params) => params,
  columns: tableColumns,
  showTableSetting: false,
  useSearchForm: false,
  canResize: false,
});

const fetchMemberListSuccess = ({items}) => {
  memberList.value = items
}

function handleMemberSelected (record, index, event) {
  state.value = record.id
  visible.value = false
}

const memberDisplay = computed(() => {
  if(memberList.value.length > 0){
    let member = memberList.value.find(member => member.id === state.value)
    if(member){
      return member.name
    }
    return state.value
  }else{
    return state.value
  }
})

const valueChange = (e) => {
  if(e.pointerType === 'mouse' && e.type === 'click'){
    state.value = ''
  }
}
</script>