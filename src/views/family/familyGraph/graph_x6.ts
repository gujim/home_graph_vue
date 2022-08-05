import XEUtils, { ToArrayTreeOptions } from 'xe-utils'
import { Edge, Node } from '@antv/x6'
import { FamilyMember } from '/@/api/family/familyMember'
// 生成所有的节点
export function toNodes(list: FamilyMember[], options: ToArrayTreeOptions<FamilyMember>):Node.Metadata[] {
  let res:Node.Metadata[] = []
  res = list.map(l => ({
    id: l[options.key || 'id'], // String，可选，节点的唯一标识
    x: 40,       // Number，必选，节点位置的 x 值
    y: 40,       // Number，必选，节点位置的 y 值
    width: 80,   // Number，可选，节点大小的 width 值
    height: 40,  // Number，可选，节点大小的 height 值
    label: l.name, // String，节点标签
    data: l,
  }))
  // let listTree = XEUtils.toArrayTree(list, options)
  return res
}
// 生成所有的边
export function toEdges(list: Node.Metadata[], options: ToArrayTreeOptions<FamilyMember>):Edge.Metadata[] {
  let res:Edge.Metadata[] = []
  res = list.map(l => ({
    id: l[options.key || 'id'], // String，可选，节点的唯一标识
    x: 40,       // Number，必选，节点位置的 x 值
    y: 40,       // Number，必选，节点位置的 y 值
    width: 80,   // Number，可选，节点大小的 width 值
    height: 40,  // Number，可选，节点大小的 height 值
    label: l.name, // String，节点标签
  }))
  // let listTree = XEUtils.toArrayTree(list, options)
  return res
}