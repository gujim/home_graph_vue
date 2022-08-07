import { Cell, Dom, Edge, Graph, Node } from '@antv/x6'
import { FamilyMember } from '/@/api/family/familyMember'
import XEUtils, { ToArrayTreeOptions } from 'xe-utils'
import { getAvatarUrl } from './avatar'
import dagre from 'dagre'
import hereImg from '/@/assets/images/here.png';
import { Options as GraphOptions } from '@antv/x6/lib/graph/options'

// 选项 节点的宽高
const width = 220
const height = 80
export class FamilyMemberGraph extends Graph{
  dataArray: FamilyMember[]
  me: FamilyMember
  xeOptions: ToArrayTreeOptions<FamilyMember>
  // 图选项
  graphOptions = { 
    // 图的方向 从顶部至底部
    rankdir: "TB", 
    // 节点间距
    nodesep: 48,
    // 层级间距 
    ranksep: 48,
  }
  constructor(
    elem: HTMLElement, 
    dataArray: FamilyMember[], 
    xeOptions: ToArrayTreeOptions<FamilyMember>, 
    me?: FamilyMember | undefined,
    options?: Partial<GraphOptions.Manual>
  ){
    super(Object.assign({
      container: elem,//document.getElementById('container') as HTMLElement,
      background: {
        color: '#fcfcfc', // 设置画布背景颜色
      },
      grid: {
        size: 10,      // 网格大小 10px
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
      mousewheel: true,
      // 允许选择
      selecting: true,
    }, options))
    this.dataArray = dataArray
    this.xeOptions = xeOptions
    this.me = me ? me : (dataArray.find(l => l.isMe === '1') || dataArray[0])
    this.init()
  }
  // 初始化
  init(){
    this.crateNodeEdge()
  }
  // 生成所有的节点
  crateNodeEdge(){
    if(this.dataArray.length > 0){
      // 将list转tree
      let treeData = XEUtils.toArrayTree(this.dataArray, this.xeOptions)
      // 获取me的根节点
      let data = this.getMeRootTree(treeData)
      // 无限获取me的上一代
      data = this.getParentTop(this.me)
      if(!data){
        data = treeData[0]
      }
      let nodes = XEUtils.toTreeArray([data], this.xeOptions).map(item => this.createNodeBy(item))
      let edges = this.createEdges([data], this.xeOptions.children || 'children', nodes)
      this.resetCells([...nodes, ...edges])
      this.autoLayout()
      this.centerContent()
    }
  }
  // 自动布局
  autoLayout(){
    let nodes = this.getNodes()
    let edges = this.getEdges()
    const g = new dagre.graphlib.Graph()
    
    g.setGraph(this.graphOptions)
    g.setDefaultEdgeLabel(() => ({}))
    nodes.forEach((node) => {
      g.setNode(node.id, { width, height })
    })
    
    edges.forEach((edge) => {
      const source = edge.getSourceCell()
      const target = edge.getTargetCell() 
      if(source !== null && target !== null){
        g.setEdge(source.id, target.id)
      }
    })
    dagre.layout(g)
    this.freeze()
  
    g.nodes().forEach((id) => {
      const node = this.getCellById(id) as Node
      if (node) {
        const pos = g.node(id)      
        node.position(pos.x, pos.y)
      }
    })
  
    this.unfreeze()
  }
  // 创建一个节点
  createNodeBy(record: FamilyMember){
    return this.createNode({
      id: record.id,
      shape: 'family-member',
      width: width,
      height: height,
      attrs: {
        '.name': { text: Dom.breakText(record.name || '', { width: 160, height: 45 }) },
        '.image': { xlinkHref: getAvatarUrl(record) },
        '.card': { stroke: record.sex === '1' ? '#5F95FF' : record.sex === '2' ? 'pink' : 'gray' },
        '.me': { xlinkHref: hereImg, display: record.isMe === '1' ? 'inherit' : 'none' }
      }
    })
  }
  // 创建一个边
  createEdgeBy(source: Cell | undefined, target: Cell | undefined): Edge<Edge.Properties> | undefined{
    if(source !== undefined && target !== undefined){
      return super.createEdge({
        shape: 'edge',
        source: { cell: source.id },
        target: { cell: target.id },
        router: {
          // 水平或垂直的正交线段组成，并自动避开路径上的其他节点
          name: 'manhattan',
          args: {
            startDirections: ['bottom'],
            endDirections: ['top'],
          }
        },
        attrs: {
          line: {
            stroke: '#5F95FF',
            opacity: 0.6,
            sourceMarker: {
              name: 'circle',
              r: 1,
            },
            targetMarker: {
              name: 'circle',
              r: 1,
            }
          }
        }
      })
    }
    return undefined
  }
  // 生成所有的边
  createEdges(list: FamilyMember[], childrenKey: string, nodes: Node<Node.Properties>[]): Edge<Edge.Properties>[] {
    let edges: Edge<Edge.Properties>[] = []
    list.forEach(l => {
      if(l[childrenKey] && l[childrenKey].length > 0){
        l[childrenKey].forEach(c => {
          const getNode = id => nodes.find(n => n.id === id)
          let edge = this.createEdgeBy( getNode(l.id), getNode(c.id))
          if(edge){
            edges.push(edge)
          }
          edges.push(...this.createEdges( l[childrenKey], childrenKey, nodes))
        })
      }
    })  
    return edges
  }
  // 获取根节点是me的对象
  getMeRootTree(familyMembers: FamilyMember[]): FamilyMember | undefined{
    let res: FamilyMember | undefined
    let children = this.xeOptions.children || 'children'
    familyMembers.forEach(f => {
      if(res) return
      if(f.id === this.me.id){
        res = f
      }else if(children in f && f[children] && f[children].length > 0){
        res = this.getMeRootTree(f[children])
      }
    })
    return res
  }
  // 无限获取上一代
  getParentTop(familyMember: FamilyMember): FamilyMember{
    let parent = this.xeOptions.parentKey || 'parent'
    if(parent in familyMember && familyMember[parent]){
      let parentMember = this.dataArray.find(l => l.id === familyMember[parent])    
      if(parentMember){
        parentMember[this.xeOptions.children || 'children'] = [familyMember]
        return this.getParentTop(parentMember)
      }
      return familyMember
    }
    return familyMember
  }

  public getMe(): FamilyMember{
    return this.me
  }
}

// 创建自定义节点
export function registerNode(){
  Graph.registerNode("family-member", {
    width: width,
    height: height,
    markup: [{
      tagName: 'rect',
      attrs: {
        class: 'card'
      }
    },{
      tagName: 'image',
      attrs: {
        class: 'image',
      },
    },{
      // 我的角标
      tagName: 'image',
      attrs: {
        class: 'me',
      },
    },{
      tagName: 'text',
      attrs: {
        class: 'name',
      },
    }],
    attrs: {
      '.card': {
        rx: 10,
        ry: 10,
        refWidth: '100%',
        refHeight: '100%',
        fill: '#f9f9f9',
        stroke: '#5F95FF',
        strokeWidth: 1,
        // pointerEvents: 'visiblePainted',
      },
      '.image': {
        x: 8,
        y: 8,
        width: (height - 16),
        height: (height - 16),
        opacity: 0.7
      },
      '.me': {
        x: width - 24-5,
        y: 5,
        width: 24,
        height: 24,
        opacity: 0.7,
        display: 'none'
      },
      '.name': {
        ref: '.image',
        refX: (height - 16) + 5, // 图片宽度 + 图片与标签之间的间距
        refY: 0.2,
        fill: 'blue',
        fontFamily: 'Arial',
        fontSize: 16,
        fontWeight: '600',
        opacity: 0.5,
        cursor: 'pointer',
      }
    }
  }, true) // 覆盖
}