// 主站原生短剧画布入口。
// 禁止通过 iframe 或独立 HTML 接入第三方工作台：画布必须共享平台鉴权、
// 数字员工、模型目录、项目数据和任务状态。
import Canvas from './Canvas';

export default function CanvasHub() {
  return <Canvas />;
}
