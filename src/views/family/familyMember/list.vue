<!--
 * Copyright (c) 2013-Now http://jeesite.com All rights reserved.
 * No deletion without permission, or be held responsible to law.
 * @author gujimeng
-->
<template>
  <div>
    <BasicTable @register="registerTable">
      <template #tableTitle>
        <Icon :icon="getTitle.icon" class="m-1 pr-1" />
        <span> {{ getTitle.value }} </span>
      </template>
      <template #toolbar>
        <a-button type="primary" @click="handleForm({})" v-auth="'family:familyMember:edit'">
          <Icon icon="fluent:add-12-filled" /> {{ t('新增') }}
        </a-button>
      </template>
      <template #firstColumn="{ record }">
        
        <TableImg :size="60" :simpleShow="true" :imgList="[avatarUrl(record)]" />
        <a @click="handleForm({ id: record.id })">
          {{ record.name }}
        </a>
      </template>
    </BasicTable>
    <InputForm @register="registerDrawer" @success="handleSuccess" />
  </div>
</template>
<script lang="ts">
  import InputForm from './form.vue';
  import { TableImg } from '/@/components/Table';
  export default defineComponent({
    name: 'ViewsFamilyFamilyMemberList',
    components: { Icon, BasicTable, InputForm, TableImg }
  });
</script>
<script lang="ts" setup>
  import { defineComponent } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { router } from '/@/router';
  import { Icon } from '/@/components/Icon';
  import { BasicTable, BasicColumn, useTable } from '/@/components/Table';
  import { FamilyMember, familyMemberDelete, familyMemberListData } from '/@/api/family/familyMember';
  import { useDrawer } from '/@/components/Drawer';
  import { FormProps } from '/@/components/Form';
  import { useGlobSetting } from '/@/hooks/setting';
  import logoImg from '/@/assets/images/logo.png';

  const { t } = useI18n('family.familyMember');
  const { showMessage } = useMessage();
  const getTitle = {
    icon: router.currentRoute.value.meta.icon || 'ant-design:book-outlined',
    value: router.currentRoute.value.meta.title || t('成员管理'),
  };

  const searchForm: FormProps = {
    baseColProps: { lg: 6, md: 8 },
    labelWidth: 90,
    schemas: [
      {
        label: t('姓名'),
        field: 'name',
        component: 'Input',
      },
      {
        label: t('成员性别'),
        field: 'sex',
        component: 'Select',
        componentProps: {
          dictType: 'sys_user_sex',
          allowClear: true,
        },
      },
      {
        label: t('父亲'),
        field: 'father',
        component: 'Input',
      },
      {
        label: t('母亲'),
        field: 'mother',
        component: 'Input',
      },
      {
        label: t('已婚'),
        field: 'marriage',
        component: 'Select',
        componentProps: {
          dictType: 'sys_yes_no',
          allowClear: true,
        },
      },
      {
        label: t('对象'),
        field: 'levers',
        component: 'Input',
      },
      {
        label: t('出生日期'),
        field: 'birthday',
        component: 'DatePicker',
        componentProps: {
          format: 'YYYY-MM-DD HH:mm',
          showTime: { format: 'HH:mm' },
        },
      },
      {
        label: t('状态'),
        field: 'status',
        component: 'Select',
        componentProps: {
          dictType: 'sys_search_status',
          allowClear: true,
          onChange: handleSuccess,
        },
      },
      {
        label: t('创建者'),
        field: 'createBy',
        component: 'Input',
      },
      {
        label: t('创建时间'),
        field: 'createDate',
        component: 'Input',
      },
      {
        label: t('更新者'),
        field: 'updateBy',
        component: 'Input',
      },
      {
        label: t('更新时间'),
        field: 'updateDate',
        component: 'Input',
      },
      {
        label: t('备注信息'),
        field: 'remarks',
        component: 'Input',
      },
    ],
  };

  const tableColumns: BasicColumn[] = [
    {
      title: t('姓名'),
      dataIndex: 'name',
      key: 'a.name',
      sorter: true,
      width: 150,
      align: 'left',
      slots: { customRender: 'firstColumn' },
    },
    {
      title: t('成员性别'),
      dataIndex: 'sex',
      key: 'a.sex',
      sorter: true,
      width: 130,
      align: 'center',
      dictType: 'sys_user_sex',
    },
    {
      title: t('父亲'),
      dataIndex: 'fatherName',
      key: 'a.fatherName',
      sorter: true,
      width: 130,
      align: 'left',
    },
    {
      title: t('母亲'),
      dataIndex: 'motherName',
      key: 'a.motherName',
      sorter: true,
      width: 130,
      align: 'left',
    },
    {
      title: t('已婚'),
      dataIndex: 'marriage',
      key: 'a.marriage',
      sorter: true,
      width: 130,
      align: 'center',
      dictType: 'sys_yes_no',
    },
    {
      title: t('对象'),
      dataIndex: 'leversName',
      key: 'a.leversName',
      sorter: true,
      width: 130,
      align: 'left',
    },
    {
      title: t('出生日期'),
      dataIndex: 'birthday',
      key: 'a.birthday',
      sorter: true,
      width: 130,
      align: 'center',
    },
    {
      title: t('状态'),
      dataIndex: 'status',
      key: 'a.status',
      sorter: true,
      width: 130,
      align: 'center',
      dictType: 'sys_search_status',
    },
    {
      title: t('创建时间'),
      dataIndex: 'createDate',
      key: 'a.create_date',
      sorter: true,
      width: 130,
      align: 'center',
    },
    {
      title: t('备注信息'),
      dataIndex: 'remarks',
      key: 'a.remarks',
      sorter: true,
      width: 130,
      align: 'left',
    },
  ];

  const actionColumn: BasicColumn = {
    width: 160,
    actions: (record: Recordable) => [
      {
        icon: 'clarity:note-edit-line',
        title: t('编辑成员'),
        onClick: handleForm.bind(this, { id: record.id }),
        auth: 'family:familyMember:edit',
      },
      {
        icon: 'ant-design:delete-outlined',
        color: 'error',
        title: t('删除成员'),
        popConfirm: {
          title: t('是否确认删除成员'),
          confirm: handleDelete.bind(this, { id: record.id }),
        },
        auth: 'family:familyMember:edit',
      },
    ],
  };

  const [registerDrawer, { openDrawer }] = useDrawer();
  const [registerTable, { reload }] = useTable({
    api: familyMemberListData,
    beforeFetch: (params) => {
      return params;
    },
    columns: tableColumns,
    actionColumn: actionColumn,
    formConfig: searchForm,
    showTableSetting: true,
    useSearchForm: true,
    canResize: true,
  });

  function handleForm(record: Recordable) {
    openDrawer(true, record);
  }

  async function handleDelete(record: Recordable) {
    const res = await familyMemberDelete(record);
    showMessage(res.message);
    handleSuccess();
  }

  function handleSuccess() {
    reload();
  }

  function avatarUrl(record: FamilyMember){
    if (record.avatarUrl) {
      const { ctxPath } = useGlobSetting();
      let url = record.avatarUrl || '/ctxPath/static/images/user1.jpg';
      url = url.replace('/ctxPath/', ctxPath + '/');
      return url || logoImg;
    }else{
      return ""
    }
  }
</script>
