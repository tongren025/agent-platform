// 页面内统一的“问号说明”：短说明用 Tooltip，保持键盘可达和足够点击面积。
import { QuestionCircleOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import './UserHelp.css';

type HelpHintProps = {
  title: string;
  content: React.ReactNode;
  tone?: 'light' | 'dark';
};

export default function HelpHint({ title, content, tone = 'light' }: HelpHintProps) {
  return (
    <Tooltip
      placement="top"
      trigger={['hover', 'focus']}
      title={(
        <div className="help-hint-content">
          <strong>{title}</strong>
          <span>{content}</span>
        </div>
      )}
    >
      <button
        type="button"
        className={`help-hint-button is-${tone}`}
        aria-label={`查看说明：${title}`}
      >
        <QuestionCircleOutlined aria-hidden="true" />
      </button>
    </Tooltip>
  );
}
