<!--
 * Copyright (c) 2013-Now http://jeesite.com All rights reserved.
 * No deletion without permission, or be held responsible to law.
 * @author gujimeng
-->
<template>
  <BasicDrawer
    v-bind="$attrs"
    :showFooter="true"
    :okAuth="'family:familyMember:edit'"
    @register="registerDrawer"
    @ok="handleSubmit"
    width="60%"
  >
    <template #title>
      <Icon :icon="getTitle.icon" class="pr-1 m-1" />
      <span> {{ getTitle.value }} </span>
    </template>
    <BasicForm @register="registerForm">
      <template #avatar="{ model, field }">
        <CropperAvatar
          :value="model[field]"
          btnText="更换头像"
          :btnProps="{ preIcon: 'ant-design:cloud-upload-outlined' }"
          @change="updateAvatar"
          width="150"
        />
      </template>
      <template #familyMemberPropertiesList>
        <BasicTable
          @register="registerFamilyMemberPropertiesTable"
          @row-click="handleFamilyMemberPropertiesRowClick"
        />
        <a-button class="mt-2" @click="handleFamilyMemberPropertiesAdd" v-auth="'family:familyMember:edit'">
          <Icon icon="ant-design:plus-circle-outlined" /> {{ t('新增') }}
        </a-button>
      </template>
    </BasicForm>
  </BasicDrawer>
</template>
<script lang="ts">
  import familyMemberSelector from '../components/familyMemberSelector.vue';
  import { Icon } from '/@/components/Icon';
  import { BasicTable, useTable } from '/@/components/Table';
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  import { CropperAvatar } from '/@/components/Cropper';
  export default defineComponent({
    name: 'ViewsFamilyFamilyMemberForm',
    components: { Icon, BasicForm, BasicTable, BasicDrawer, familyMemberSelector, CropperAvatar }
  });
</script>
<script lang="ts" setup>
  import { BasicForm, FormSchema, useForm, useComponentRegister } from '/@/components/Form';
  import { defineComponent, ref, computed } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { router } from '/@/router';
  import { FamilyMember, familyMemberSave, familyMemberForm } from '/@/api/family/familyMember';
  import { useGlobSetting } from '/@/hooks/setting';
  import logoImg from '/@/assets/images/logo.png';

  useComponentRegister('FamilyMemberSelector', familyMemberSelector)

  const emit = defineEmits(['success', 'register']);

  // 头像
  const avatarBase64 = ref<String>('');

  const { t } = useI18n('family.familyMember');
  const { showMessage } = useMessage();
  const record = ref<FamilyMember>({} as FamilyMember);
  const getTitle = computed(() => ({
    icon: router.currentRoute.value.meta.icon || 'ant-design:book-outlined',
    value: record.value.isNewRecord ? t('新增成员') : t('编辑成员'),
  }));

  const inputFormSchemas: FormSchema[] = [
    {
      label: t('姓名'),
      field: 'name',
      component: 'Input',
      componentProps: {
        maxlength: 64,
      },
      required: true,
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
      label: t('手机号'),
      field: 'phone',
      component: 'Input',
      componentProps: {
        maxlength: 11,
      },
      rules: [{ pattern: /^1[3,4,5,6,7,8,9]\d{9}$/g, message: t('请输入手机号码') }],
    },
    {
      label: t('邮箱'),
      field: 'email',
      component: 'Input',
      componentProps: {
        maxlength: 64,
      },
      rules: [{ type: 'email', message: t('请输入邮箱地址') }],
    },
    {
      label: t('父亲'),
      field: 'father',
      component: 'FamilyMemberSelector',
    },
    {
      label: t('母亲'),
      field: 'mother',
      component: 'FamilyMemberSelector',
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
      component: 'FamilyMemberSelector',
    },
    {
      label: t('出生日期'),
      field: 'birthday',
      component: 'DatePicker',
      componentProps: {
        format: 'YYYY-MM-DD HH:mm',
        showTime: { format: 'HH:mm' },
      },
    },{
      label: t('头像'),
      field: 'avatarUrl',
      component: 'Input',
      slot: 'avatar',
      colProps: { lg: 24, md: 24 },
    },
    {
      label: t('备注信息'),
      field: 'remarks',
      component: 'InputTextArea',
      componentProps: {
        maxlength: 500,
      },
      colProps: { lg: 24, md: 24 },
    },
    {
      label: t('成员属性'),
      field: 'familyMemberPropertiesList',
      component: 'Input',
      colProps: { lg: 24, md: 24 },
      slot: 'familyMemberPropertiesList',
    },
  ];

  const [registerForm, { resetFields, setFieldsValue, validate }] = useForm({
    labelWidth: 120,
    schemas: inputFormSchemas,
    baseColProps: { lg: 12, md: 24 },
  });

  const [registerFamilyMemberPropertiesTable, familyMemberPropertiesTable] = useTable({
    actionColumn: {
      width: 60,
      actions: (record: Recordable) => [
        {
          icon: 'ant-design:delete-outlined',
          color: 'error',
          popConfirm: {
            title: '是否确认删除',
            confirm: handleFamilyMemberPropertiesDelete.bind(this, record),
          },
          auth: 'family:familyMember:edit',
        },
      ],
    },
    rowKey: 'id',
    pagination: false,
    bordered: true,
    size: 'small',
    inset: true,
  });

  async function setFamilyMemberPropertiesTableData(_res: Recordable) {
    familyMemberPropertiesTable.setColumns([
      {
        title: t('属性名'),
        dataIndex: 'propertyName',
        width: 130,
        align: 'left',
        editRow: true,
        editComponent: 'Input',
        editComponentProps: {
          maxlength: 64,
        },
        editRule: false,
      },
      {
        title: t('属性值'),
        dataIndex: 'propertyValue',
        width: 130,
        align: 'left',
        editRow: true,
        editComponent: 'Input',
        editComponentProps: {
          maxlength: 255,
        },
        editRule: false,
      },
      {
        title: t('排序值'),
        dataIndex: 'sort',
        width: 130,
        align: 'center',
        editRow: true,
        editComponent: 'Input',
        editRule: false,
      },
      {
        title: t('备注信息'),
        dataIndex: 'remarks',
        width: 130,
        align: 'left',
        editRow: true,
        editComponent: 'Input',
        editComponentProps: {
          maxlength: 500,
        },
        editRule: false,
      },
    ]);
    familyMemberPropertiesTable.setTableData(record.value.familyMemberPropertiesList || []);
  }

  function handleFamilyMemberPropertiesRowClick(record: Recordable) {
    record.onEdit?.(true, false);
  }

  function handleFamilyMemberPropertiesAdd() {
    familyMemberPropertiesTable.insertTableDataRecord({
      id: new Date().getTime(),
      isNewRecord: true,
      editable: true,
    });
  }

  function handleFamilyMemberPropertiesDelete(record: Recordable) {
    familyMemberPropertiesTable.deleteTableDataRecord(record);
  }

  async function getFamilyMemberPropertiesList() {
    let familyMemberPropertiesListValid = true;
    let familyMemberPropertiesList: Recordable[] = [];
    for (const record of familyMemberPropertiesTable.getDataSource()) {
      if (!(await record.onEdit?.(false, true))) {
        familyMemberPropertiesListValid = false;
      }
      familyMemberPropertiesList.push({
        ...record,
        id: !!record.isNewRecord ? '' : record.id,
      });
    }
    for (const record of familyMemberPropertiesTable.getDelDataSource()) {
      if (!!record.isNewRecord) continue;
      familyMemberPropertiesList.push({
        ...record,
        status: '1',
      });
    }
    if (!familyMemberPropertiesListValid) {
      throw new Error('familyMemberPropertiesList valid.');
    }
    return familyMemberPropertiesList;
  }

  const [registerDrawer, { setDrawerProps, closeDrawer }] = useDrawerInner(async (data) => {
    resetFields();
    setDrawerProps({ loading: true });
    const res = await familyMemberForm(data);
    // 处理图片
    record.value = (res.familyMember || {}) as FamilyMember;
    record.value.__t = new Date().getTime();
    if (record.value.avatarUrl) {
      const { ctxPath } = useGlobSetting();
      let url = record.value.avatarUrl || '/ctxPath/static/images/user1.jpg';
      url = url.replace('/ctxPath/', ctxPath + '/');
      record.value.avatarUrl = url || logoImg;
    }
    setFieldsValue(record.value);
    setFamilyMemberPropertiesTableData(res);
    setDrawerProps({ loading: false });
  });

  async function handleSubmit() {
    try {
      const data = await validate();
      if (avatarBase64.value != '') {
        data.avatarBase64 = avatarBase64.value;
      }
      setDrawerProps({ confirmLoading: true });
      const params: any = {
        isNewRecord: record.value.isNewRecord,
        id: record.value.id,
      };
      data.familyMemberPropertiesList = await getFamilyMemberPropertiesList();
      // console.log('submit', params, data, record);
      const res = await familyMemberSave(params, data);
      showMessage(res.message);
      setTimeout(closeDrawer);
      emit('success', data);
    } catch (error: any) {
      if (error && error.errorFields) {
        showMessage(t('您填写的信息有误，请根据提示修正。'));
      }
      console.log('error', error);
    } finally {
      setDrawerProps({ confirmLoading: false });
    }
  }


  // 头像处理
  function updateAvatar(source: string) {
    avatarBase64.value = source;
  }
</script>
