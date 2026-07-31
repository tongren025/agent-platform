// 画布侧边栏工具栏组件：提供各类节点添加与素材拖拽入口
import { memo, useCallback, useState } from 'react';
import { Button, Tooltip, Upload } from 'antd';
import {
  FileTextOutlined, VideoCameraOutlined, HighlightOutlined,
  UploadOutlined, GroupOutlined, ImportOutlined,
  LeftOutlined, RightOutlined,
} from '@ant-design/icons';

const ITEMS = [
  { type: 'data', icon: <FileTextOutlined />, label: '数据节点', desc: '写创意、剧本、设定', color: '#6366f1' },
  { type: 'storyboard', icon: <VideoCameraOutlined />, label: '分镜格', desc: '画面描述+镜头参数', color: '#0ea5e9' },
  { type: 'sticky', icon: <HighlightOutlined />, label: '便签', desc: '随手备忘、灵感速记', color: '#eab308' },
  { type: 'group', icon: <GroupOutlined />, label: '分组框', desc: '框选一组节点归类', color: '#10b981' },
] as const;

interface CanvasSidebarProps {
  disabled: boolean;
  onAdd: (type: string) => void;
  onImport: () => void;
  onUpload: (files: FileList | null) => void;
}

export const CanvasSidebar = memo(function CanvasSidebar({ disabled, onAdd, onImport, onUpload }: CanvasSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  const handleDragStart = useCallback((e: React.DragEvent, type: string) => {
    e.dataTransfer.setData('application/canvas-node-type', type);
    e.dataTransfer.effectAllowed = 'copy';
  }, []);

  if (collapsed) {
    return (
      <div style={{
        width: 36, display: 'flex', flexDirection: 'column', alignItems: 'center',
        paddingTop: 8, gap: 8, background: '#fff', borderRadius: 12,
        border: '1px solid #eef0f6', flexShrink: 0,
      }}>
        <Tooltip title="展开面板" placement="right">
          <Button size="small" icon={<RightOutlined />} type="text" aria-label="展开素材面板"
            onClick={() => setCollapsed(false)} style={{ width: 28, height: 28 }} />
        </Tooltip>
        {ITEMS.map((item) => (
          <Tooltip key={item.type} title={item.label} placement="right">
            <button
              type="button"
              aria-label={`添加${item.label}`}
              disabled={disabled}
              draggable={!disabled}
              onDragStart={(e) => handleDragStart(e, item.type)}
              onClick={() => !disabled && onAdd(item.type)}
              style={{
                width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: 6, cursor: disabled ? 'not-allowed' : 'grab', fontSize: 14,
                color: disabled ? '#d1d5db' : item.color, transition: 'background .12s',
                opacity: disabled ? 0.5 : 1, border: 0, background: 'transparent', padding: 0,
              }}
              onMouseEnter={(e) => { if (!disabled) (e.currentTarget).style.background = '#f1f5f9'; }}
              onMouseLeave={(e) => { (e.currentTarget).style.background = 'transparent'; }}
            >
              {item.icon}
            </button>
          </Tooltip>
        ))}
      </div>
    );
  }

  return (
    <div style={{
      width: 160, display: 'flex', flexDirection: 'column',
      background: '#fff', borderRadius: 12, border: '1px solid #eef0f6',
      flexShrink: 0, overflow: 'hidden',
    }}>
      {/* 标题栏 */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 10px 4px', borderBottom: '1px solid #f1f5f9',
      }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: '#64748b', letterSpacing: 1 }}>素材</span>
        <Button size="small" icon={<LeftOutlined />} type="text" aria-label="收起素材面板"
          onClick={() => setCollapsed(true)} style={{ width: 22, height: 22, fontSize: 10 }} />
      </div>

      {/* 节点列表 */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '6px 6px' }}>
        {ITEMS.map((item) => (
          <button
            type="button"
            disabled={disabled}
            aria-label={`添加${item.label}`}
            key={item.type}
            draggable={!disabled}
            onDragStart={(e) => handleDragStart(e, item.type)}
            onClick={() => !disabled && onAdd(item.type)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '7px 8px', borderRadius: 8, cursor: disabled ? 'not-allowed' : 'grab',
              transition: 'background .12s', marginBottom: 2, opacity: disabled ? 0.5 : 1,
              width: '100%', border: 0, background: 'transparent', textAlign: 'left',
            }}
            onMouseEnter={(e) => { if (!disabled) (e.currentTarget).style.background = '#f8fafc'; }}
            onMouseLeave={(e) => { (e.currentTarget).style.background = 'transparent'; }}
          >
            <div style={{
              width: 30, height: 30, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: `${item.color}12`, color: item.color, fontSize: 15, flexShrink: 0,
            }}>
              {item.icon}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#334155', lineHeight: 1.3 }}>{item.label}</div>
              <div style={{ fontSize: 10, color: '#64748b', lineHeight: 1.3 }}>{item.desc}</div>
            </div>
          </button>
        ))}

        {/* 分隔线 */}
        <div style={{ height: 1, background: '#f1f5f9', margin: '6px 4px' }} />

        {/* 导入/上传 */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => !disabled && onImport()}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '7px 8px', borderRadius: 8, cursor: disabled ? 'not-allowed' : 'pointer',
            transition: 'background .12s', opacity: disabled ? 0.5 : 1,
            width: '100%', border: 0, background: 'transparent', textAlign: 'left',
          }}
          onMouseEnter={(e) => { if (!disabled) (e.currentTarget).style.background = '#f8fafc'; }}
          onMouseLeave={(e) => { (e.currentTarget).style.background = 'transparent'; }}
        >
          <div style={{
            width: 30, height: 30, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: '#8b5cf612', color: '#8b5cf6', fontSize: 15, flexShrink: 0,
          }}>
            <ImportOutlined />
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#334155', lineHeight: 1.3 }}>从看板导入</div>
            <div style={{ fontSize: 10, color: '#64748b', lineHeight: 1.3 }}>铺开已有卡片</div>
          </div>
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={() => !disabled && onUpload(null)}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '7px 8px', borderRadius: 8, cursor: disabled ? 'not-allowed' : 'pointer',
            transition: 'background .12s', opacity: disabled ? 0.5 : 1,
            width: '100%', border: 0, background: 'transparent', textAlign: 'left',
          }}
          onMouseEnter={(e) => { if (!disabled) (e.currentTarget).style.background = '#f8fafc'; }}
          onMouseLeave={(e) => { (e.currentTarget).style.background = 'transparent'; }}
        >
          <div style={{
            width: 30, height: 30, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: '#f4364512', color: '#f43645', fontSize: 15, flexShrink: 0,
          }}>
            <UploadOutlined />
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#334155', lineHeight: 1.3 }}>上传图片</div>
            <div style={{ fontSize: 10, color: '#64748b', lineHeight: 1.3 }}>或 Ctrl+V 粘贴</div>
          </div>
        </button>
      </div>

      {/* 底部提示 */}
      <div style={{
        padding: '6px 10px', borderTop: '1px solid #f1f5f9',
        fontSize: 10, color: '#64748b', textAlign: 'center',
      }}>
        拖拽到画布 或 点击添加
      </div>
    </div>
  );
});
