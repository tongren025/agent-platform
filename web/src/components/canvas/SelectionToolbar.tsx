import { Button, Divider, Tooltip } from 'antd';
import {
  CopyOutlined, DeleteOutlined, GroupOutlined, LockOutlined, UnlockOutlined,
} from '@ant-design/icons';

export type AlignAction = 'left' | 'top' | 'right' | 'bottom' | 'distribute-h' | 'distribute-v';

interface SelectionToolbarProps {
  count: number;
  hasLocked: boolean;
  hasUnlocked: boolean;
  onAlign: (action: AlignAction) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onGroup: () => void;
  onLock: () => void;
  onUnlock: () => void;
}

const abtn: React.CSSProperties = { fontSize: 13, padding: '0 7px', height: 26, minWidth: 26 };

export function SelectionToolbar({
  count, hasLocked, hasUnlocked,
  onAlign, onDelete, onDuplicate, onGroup, onLock, onUnlock,
}: SelectionToolbarProps) {
  if (count < 2) return null;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 3,
      padding: '3px 10px',
      background: 'rgba(255,255,255,.95)', borderRadius: 10,
      border: '1px solid #e2e8f0', boxShadow: '0 2px 12px rgba(0,0,0,.08)',
      backdropFilter: 'blur(8px)',
    }}>
      <span style={{ fontSize: 11, color: '#64748b', marginRight: 2 }}>对齐</span>
      <Tooltip title="左对齐">
        <Button size="small" style={abtn} onClick={() => onAlign('left')}>←</Button>
      </Tooltip>
      <Tooltip title="顶对齐">
        <Button size="small" style={abtn} onClick={() => onAlign('top')}>↑</Button>
      </Tooltip>
      <Tooltip title="右对齐">
        <Button size="small" style={abtn} onClick={() => onAlign('right')}>→</Button>
      </Tooltip>
      <Tooltip title="底对齐">
        <Button size="small" style={abtn} onClick={() => onAlign('bottom')}>↓</Button>
      </Tooltip>
      <Tooltip title="水平均分">
        <Button size="small" style={abtn} onClick={() => onAlign('distribute-h')}>↔</Button>
      </Tooltip>
      <Tooltip title="垂直均分">
        <Button size="small" style={abtn} onClick={() => onAlign('distribute-v')}>↕</Button>
      </Tooltip>
      <Divider type="vertical" style={{ margin: '0 2px' }} />
      <Tooltip title="复制选中 (Ctrl+D)">
        <Button size="small" icon={<CopyOutlined />} onClick={onDuplicate} />
      </Tooltip>
      <Tooltip title="创建分组 (Ctrl+G)">
        <Button size="small" icon={<GroupOutlined />} onClick={onGroup} />
      </Tooltip>
      {hasUnlocked && (
        <Tooltip title="锁定选中">
          <Button size="small" icon={<LockOutlined />} onClick={onLock} />
        </Tooltip>
      )}
      {hasLocked && (
        <Tooltip title="解锁选中">
          <Button size="small" icon={<UnlockOutlined />} onClick={onUnlock} />
        </Tooltip>
      )}
      <Tooltip title="删除选中">
        <Button size="small" danger icon={<DeleteOutlined />} onClick={onDelete} />
      </Tooltip>
      <span style={{ fontSize: 11, color: '#94a3b8', marginLeft: 2 }}>
        {count} 个节点
      </span>
    </div>
  );
}
