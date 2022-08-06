import { FamilyMember } from "/@/api/family/familyMember";
import { useGlobSetting } from "/@/hooks/setting";
import memberImg from '/@/assets/images/member.png';

export function getAvatarUrl(record: FamilyMember){
  if (record.avatarUrl) {
    const { ctxPath } = useGlobSetting();
    let url = record.avatarUrl || '/ctxPath/static/images/user1.jpg';
    url = url.replace('/ctxPath/', ctxPath + '/');
    return url || memberImg
  }else{
    return memberImg
  }
}