/**
 * Copyright (c) 2013-Now http://jeesite.com All rights reserved.
 * No deletion without permission, or be held responsible to law.
 * @author gujimeng
 */
import { defHttp } from '/@/utils/http/axios';
import { useGlobSetting } from '/@/hooks/setting';
import { BasicModel, Page } from '../model/baseModel';

const { adminPath } = useGlobSetting();

export interface FamilyMember extends BasicModel<FamilyMember> {
  name?: string; // 姓名
  sex?: string; // 成员性别
  phone?: string; // 手机号
  email?: string; // 邮箱
  father?: string; // 父亲
  mother?: string; // 母亲
  marriage?: string; // 已婚
  levers?: string; // 对象
  birthday?: string; // 出生日期
  userId?: string; // 用户
  avatar?: string; // 头像
  avatarUrl?: string; //头像url
  avatarBase64?: string; // 头像base64
  familyMemberPropertiesList?: any[]; // 子表列表
}

export const familyMemberList = (params?: FamilyMember | any) =>
  defHttp.get<FamilyMember>({ url: adminPath + '/family/familyMember/list', params });

export const familyMemberListData = (params?: FamilyMember | any) =>
  defHttp.post<Page<FamilyMember>>({ url: adminPath + '/family/familyMember/listData', params });

export const familyMemberForm = (params?: FamilyMember | any) =>
  defHttp.get<FamilyMember>({ url: adminPath + '/family/familyMember/form', params });

export const familyMemberSave = (params?: any, data?: FamilyMember | any) =>
  defHttp.postJson<FamilyMember>({ url: adminPath + '/family/familyMember/save', params, data });

export const familyMemberDelete = (params?: FamilyMember | any) =>
  defHttp.get<FamilyMember>({ url: adminPath + '/family/familyMember/delete', params });
