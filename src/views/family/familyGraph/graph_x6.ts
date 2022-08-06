import { Cell, Dom, Edge, Graph, Node } from '@antv/x6'
import { FamilyMember } from '/@/api/family/familyMember'
import XEUtils, { ToArrayTreeOptions } from 'xe-utils'
import { getAvatarUrl } from './avatar'
import dagre from 'dagre'
import man from '/@/assets/svg/man.svg';
import woman from '/@/assets/svg/woman.svg';

// 选项 节点的宽高
const width = 180, height = 80
const graphOptions = { 
  // 图的方向 从顶部至底部
  rankdir: "TB", 
  // 节点间距
  nodesep: 48,
  // 层级间距 
  ranksep: 48,
}

// 创建一个节点
function createNode(graph: Graph, record: FamilyMember){
  return graph.createNode({
    id: record.id,
    shape: 'family-member',
    width,
    height,
    attrs: {
      '.name': { text: Dom.breakText(record.name || '', { width: 160, height: 45 }) },
      '.image': { xlinkHref: getAvatarUrl(record) },
      '.card': { stroke: record.sex === '1' ? '#5F95FF' : record.sex === '2' ? 'pink' : 'gray' }
    }
  })
}

// 创建一个边
function createEdge(graph: Graph, source: Cell | undefined, target: Cell | undefined): Edge<Edge.Properties> | undefined{
  if(source !== undefined && target !== undefined){
    return graph.createEdge({
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

// 自动布局
function autoLayout(graph: Graph){
  let nodes = graph.getNodes()
  let edges = graph.getEdges()
  const g = new dagre.graphlib.Graph()
  
  g.setGraph(graphOptions)
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
  graph.freeze()

  g.nodes().forEach((id) => {
    const node = graph.getCellById(id) as Node
    if (node) {
      const pos = g.node(id)      
      node.position(pos.x, pos.y)
    }
  })

  // 路径中添加固定点
  // edges.forEach((edge) => {
  //   const source = edge.getSourceNode()!
  //   const target = edge.getTargetNode()!
  //   const sourceBBox = source.getBBox()
  //   const targetBBox = target.getBBox()


  //   const gap = targetBBox.y - sourceBBox.y - sourceBBox.height
  //   const fix = sourceBBox.height
  //   const y = sourceBBox.y + fix + gap / 2
  //   edge.setVertices([
  //     { x: sourceBBox.center.x, y },
  //     { x: targetBBox.center.x, y },
  //   ])
  // })

  graph.unfreeze()
}


// 生成所有的边
function createEdges(graph: Graph, list: FamilyMember[], childrenKey: string, nodes: Node<Node.Properties>[]): Edge<Edge.Properties>[] {
  let edges: Edge<Edge.Properties>[] = []
  list.forEach(l => {
    if(l[childrenKey] && l[childrenKey].length > 0){
      l[childrenKey].forEach(c => {
        const getNode = id => nodes.find(n => n.id === id)
        let edge = createEdge(graph, getNode(l.id), getNode(c.id))
        if(edge){
          edges.push(edge)
        }
        edges.push(...createEdges(graph, l[childrenKey], childrenKey, nodes))
      })
    }
  })  
  return edges
}

// 生成所有的节点
export function crateNodeEdge(graph: Graph, list: FamilyMember[], options: ToArrayTreeOptions<FamilyMember>){
  let nodes = list.map(item => createNode(graph, item))
  
  // 将list转tree
  let treeData = XEUtils.toArrayTree(list, options)
  let edges = createEdges(graph, treeData, options.children || 'children', nodes)
  graph.resetCells([...nodes, ...edges])
  autoLayout(graph)
  graph.centerContent()
}

// 创建自定义节点
export function registerNode(){
  Graph.registerNode("family-member", {
    width,
    height,
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