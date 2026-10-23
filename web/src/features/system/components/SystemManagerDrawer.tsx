import { knowledgeApi } from '@/features/knowledge/api';
import { systemApi } from '@/features/system/api';
// 全局系统管家：结合当前路由提供操作指导、系统诊断和确认式能力管理。
import './SystemManagerDrawer.css';
import {
type SystemManagerContext,
type SystemManagerProposal,
} from '@/shared/contracts/api';
import { message } from '@/shared/ui/message';
import {
CheckCircleOutlined,
CustomerServiceOutlined,
RobotOutlined,
SendOutlined,
ToolOutlined,
UploadOutlined,
} from '@ant-design/icons';
import {
Alert,
Badge,
Button,
Drawer,
Empty,
Input,
Space,
Spin,
Tag,
Tooltip,
Typography,
} from 'antd';
import { useEffect,useRef,useState } from 'react';
import { useLocation } from 'react-router-dom';

export const OPEN_SYSTEM_MANAGER_EVENT = 'agent-studio:open-system-manager';

type ConversationMessage = {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  proposal?: SystemManagerProposal;
  changeId?: string;
  uiAction?: { kind: 'mcp_oauth' | 'mcp_test'; serverCode: string; label: string };
};

const starterQuestions = ['告诉我下一步', '检查系统状态', '解释最近失败'];
const SESSION_KEY = 'agent-studio-system-manager-session';

export default function SystemManagerDrawer() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [context, setContext] = useState<SystemManagerContext | null>(null);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [testingMcp, setTestingMcp] = useState('');
  const [oauthMcp, setOauthMcp] = useState('');
  const [sessionId, setSessionId] = useState(() => localStorage.getItem(SESSION_KEY) || '');
  const latestMessageRef = useRef<HTMLDivElement>(null);
  const skillFileRef = useRef<HTMLInputElement>(null);
  const pagePath = `${location.pathname}${location.search}`;

  const loadContext = async () => {
    setLoading(true);
    try {
      const next = await systemApi.getSystemManagerContext(pagePath);
      setContext(next);
      if (!messages.length && sessionId) {
        try {
          const history = await systemApi.getSystemManagerSession(sessionId);
          setMessages(history.messages.map((item: any) => ({
            id: crypto.randomUUID(),
            role: item.role,
            content: item.content,
            proposal: item.proposal,
            uiAction: item.uiAction,
          })));
        } catch {
          localStorage.removeItem(SESSION_KEY);
          setSessionId('');
        }
      }
      setMessages(current => current.length ? current : [{
          id: crypto.randomUUID(),
          role: 'assistant',
          content: `你现在在「${next.page.title}」。${next.page.summary}\n\n你可以问我怎么用、下一步做什么，也可以让我检查 MCP、Skill 和最近运行。`,
        }]);
    } catch (error: any) {
      message.error(error?.message || '系统管家暂时无法读取系统状态');
    } finally {
      setLoading(false);
    }
  };

  const refreshContext = async () => {
    try {
      setContext(await systemApi.getSystemManagerContext(pagePath));
    } catch (error: any) {
      message.error(error?.message || '系统状态刷新失败');
    }
  };

  useEffect(() => {
    if (open) void loadContext();
    // 路由变化后重新读取页面上下文，但保留本次对话。
  }, [open, pagePath]);

  useEffect(() => {
    const openManager = () => setOpen(true);
    window.addEventListener(OPEN_SYSTEM_MANAGER_EVENT, openManager);
    return () => window.removeEventListener(OPEN_SYSTEM_MANAGER_EVENT, openManager);
  }, []);

  const latestMessageId = messages[messages.length - 1]?.id;

  useEffect(() => {
    if (!open || !latestMessageId) return undefined;
    const frame = window.requestAnimationFrame(() => {
      latestMessageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [open, latestMessageId]);

  const send = async (preset?: string) => {
    const content = (preset ?? input).trim();
    if (!content || loading) return;
    setInput('');
    setMessages(current => [...current, {
      id: crypto.randomUUID(),
      role: 'user',
      content,
    }]);
    setLoading(true);
    try {
      const reply = await systemApi.continueSystemManagerChat(content, pagePath, sessionId || undefined);
      if (reply.sessionId && reply.sessionId !== sessionId) {
        setSessionId(reply.sessionId);
        localStorage.setItem(SESSION_KEY, reply.sessionId);
      }
      setMessages(current => [...current, {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: reply.answer,
        proposal: reply.proposal,
        uiAction: reply.uiAction,
      }]);
      if (reply.diagnostics) setContext(reply.diagnostics);
    } catch (error: any) {
      setMessages(current => [...current, {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `没有完成这次检查：${error?.message || '未知错误'}`,
      }]);
    } finally {
      setLoading(false);
    }
  };

  const confirm = async (proposal: SystemManagerProposal) => {
    setLoading(true);
    try {
      const result = await systemApi.confirmSystemManagerAction(proposal.proposalId);
      setMessages(current => [...current, {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `✓ ${result.message}`,
        changeId: result.changeId,
      }]);
      message.success('系统变更已完成');
      await loadContext();
    } catch (error: any) {
      message.error(error?.message || '操作没有完成');
    } finally {
      setLoading(false);
    }
  };

  const testMcp = async (serverCode: string) => {
    setTestingMcp(serverCode);
    try {
      const result = await systemApi.testSystemManagerMcp(serverCode);
      setMessages(current => [...current, {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `MCP「${serverCode}」连接成功，发现 ${result.toolCount} 个工具${result.tools.length ? `：${result.tools.map(item => item.name).join('、')}` : '。'}`,
      }]);
    } catch (error: any) {
      setMessages(current => [...current, {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `MCP「${serverCode}」验证失败：${error?.message || '无法连接'}`,
      }]);
    } finally {
      await refreshContext();
      setTestingMcp('');
    }
  };

  const loginMcp = async (serverCode: string) => {
    setOauthMcp(serverCode);
    try {
      const result = await systemApi.startSystemManagerMcpOAuth(
        serverCode,
        `${window.location.origin}/oauth/callback`,
      );
      window.location.assign(result.authorizationUrl);
    } catch (error: any) {
      message.error(error?.message || '无法启动 MCP 登录');
      setOauthMcp('');
    }
  };

  const proposeRollback = async (changeId: string) => {
    setLoading(true);
    try {
      const proposal = await systemApi.proposeSystemManagerRollback(changeId);
      setMessages(current => [...current, {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: '已生成回滚预览。确认后才会恢复原配置。',
        proposal,
      }]);
    } catch (error: any) {
      message.error(error?.message || '无法创建回滚预览');
    } finally {
      setLoading(false);
    }
  };

  const importSkill = async (file: File) => {
    setLoading(true);
    try {
      const result = await knowledgeApi.importSystemManagerSkill(file);
      const riskText = result.preview.risks.length
        ? result.preview.risks.join('；')
        : '未发现高风险文件';
      setMessages(current => [...current, {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `已检查 Skill「${result.preview.name}」。\n\n风险：${riskText}\n\n确认后才会安装或更新。`,
        proposal: result.proposal,
      }]);
    } catch (error: any) {
      message.error(error?.message || 'Skill ZIP 检查失败');
    } finally {
      setLoading(false);
      if (skillFileRef.current) skillFileRef.current.value = '';
    }
  };

  const unhealthyCount = context?.mcpStatus.filter(
    item => item.inUse && item.status !== 'configured',
  ).length || 0;

  return (
    <>
      <Tooltip title="系统管家：教我使用、检查问题、管理能力" placement="left">
        <div className={`system-manager-trigger${location.pathname === '/workbench' ? ' is-hidden-on-workbench' : ''}`}>
          <Badge count={unhealthyCount} size="small">
            <Button
              shape="circle"
              aria-label="打开系统管家"
              icon={<CustomerServiceOutlined />}
              onClick={() => setOpen(true)}
              className="system-manager-trigger__button"
            />
          </Badge>
        </div>
      </Tooltip>
      <Drawer
        title={(
          <Space wrap>
            <RobotOutlined />
            <span>系统管家</span>
            <Tag className="system-manager-context-tag">有上下文</Tag>
            {context?.manager.modelReference && (
              <Tooltip title={context.manager.modelConfigured ? '已固定专用模型' : '当前回退到系统默认模型'}>
                <Tag color={context.manager.modelConfigured ? 'blue' : 'orange'}>
                  {context.manager.modelReference}
                </Tag>
              </Tooltip>
            )}
          </Space>
        )}
        extra={
          <Button size="small" onClick={() => {
            localStorage.removeItem(SESSION_KEY);
            setSessionId('');
            setMessages(context ? [{
              id: crypto.randomUUID(),
              role: 'assistant',
              content: `新对话已开始。你现在在「${context.page.title}」，可以直接告诉我想完成什么。`,
            }] : []);
            void refreshContext();
          }}>
            新对话
          </Button>
        }
        open={open}
        onClose={() => setOpen(false)}
        width="min(480px, 100vw)"
        className="system-manager-drawer"
        styles={{ body: { padding: 0, display: 'flex', flexDirection: 'column' } }}
      >
        {context && (
          <div className="system-manager-context">
            <Space wrap size={[6, 6]}>
              <Tag className="system-manager-context-tag">连续会话</Tag>
              <Tag>{context.inventory.employees} 员工</Tag>
              <Tag>{context.inventory.skills} Skills</Tag>
              <Tag>{context.inventory.tools} 工具</Tag>
              <Tag color={unhealthyCount ? 'orange' : 'green'}>
                {context.inventory.mcpServers} MCP{unhealthyCount ? ` · ${unhealthyCount} 待处理` : ''}
              </Tag>
            </Space>
            {context.mcpStatus.length > 0 && (
              <div style={{ marginTop: 10 }}>
                {context.mcpStatus.map(item => (
                  <Space key={item.serverCode} style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                    <Typography.Text ellipsis style={{ maxWidth: 270 }}>
                      <ToolOutlined /> {item.name || item.serverCode}
                    </Typography.Text>
                    <Space size={4}>
                      {!item.inUse
                        ? <Tooltip title="尚未绑定到任何启用中的员工"><Tag>未绑定</Tag></Tooltip>
                        : item.status === 'configured'
                        ? <Tag color="green">已配置</Tag>
                        : <Tag color={['error', 'timeout'].includes(item.status) ? 'red' : 'orange'}>
                            {item.status === 'auth_required'
                              ? '需登录'
                              : (item.status === 'timeout'
                                  ? '连接超时'
                                  : (item.status === 'error' ? '连接失败' : '缺配置'))}
                          </Tag>}
                      {item.authType === 'oauth' && item.authStatus !== 'authorized' && (
                        <Button
                          size="small"
                          type="primary"
                          loading={oauthMcp === item.serverCode}
                          onClick={() => void loginMcp(item.serverCode)}
                        >
                          登录
                        </Button>
                      )}
                      <Button
                        size="small"
                        loading={testingMcp === item.serverCode}
                        disabled={Boolean(testingMcp) && testingMcp !== item.serverCode}
                        onClick={() => void testMcp(item.serverCode)}
                      >
                        {testingMcp === item.serverCode ? '验证中' : '验证'}
                      </Button>
                    </Space>
                  </Space>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="system-manager-messages">
          {!messages.length && !loading && <Empty description="问我这个页面怎么用" />}
          {messages.map((item, index) => (
            <div
              key={item.id}
              ref={index === messages.length - 1 ? latestMessageRef : undefined}
              className="system-manager-message"
              style={{
                display: 'flex',
                justifyContent: item.role === 'user' ? 'flex-end' : 'flex-start',
                marginBottom: 14,
              }}
            >
              <div style={{
                maxWidth: '88%',
                borderRadius: item.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                padding: '10px 12px',
                whiteSpace: 'pre-wrap',
                lineHeight: 1.65,
                background: item.role === 'user' ? '#806146' : '#f1eee8',
                color: item.role === 'user' ? '#fff' : '#302f2a',
              }}>
                {item.content}
                {item.proposal && (
                  <Alert
                    type="warning"
                    showIcon
                    message="等待你的确认"
                    description={item.proposal.summary}
                    style={{ marginTop: 10 }}
                    action={
                      <Button
                        size="small"
                        type="primary"
                        icon={<CheckCircleOutlined />}
                        onClick={() => void confirm(item.proposal!)}
                      >
                        确认执行
                      </Button>
                    }
                  />
                )}
                {item.changeId && (
                  <Button
                    size="small"
                    onClick={() => void proposeRollback(item.changeId!)}
                    style={{ marginTop: 8 }}
                  >
                    回滚这次变更
                  </Button>
                )}
                {item.uiAction && (
                  <Button
                    size="small"
                    type="primary"
                    loading={
                      (item.uiAction.kind === 'mcp_oauth' && oauthMcp === item.uiAction.serverCode)
                      || (item.uiAction.kind === 'mcp_test' && testingMcp === item.uiAction.serverCode)
                    }
                    onClick={() => {
                      if (item.uiAction?.kind === 'mcp_oauth') void loginMcp(item.uiAction.serverCode);
                      if (item.uiAction?.kind === 'mcp_test') void testMcp(item.uiAction.serverCode);
                    }}
                    style={{ marginTop: 8 }}
                  >
                    {item.uiAction.label}
                  </Button>
                )}
              </div>
            </div>
          ))}
          {loading && <div style={{ textAlign: 'center', padding: 12 }}><Spin size="small" /> 正在检查</div>}
        </div>

        <div className="system-manager-composer">
          <Space wrap size={[6, 6]} style={{ marginBottom: 10 }}>
            {starterQuestions.map(question => (
              <Button key={question} size="small" onClick={() => void send(question)}>{question}</Button>
            ))}
            <Button size="small" icon={<UploadOutlined />} onClick={() => skillFileRef.current?.click()}>
              导入 Skill ZIP
            </Button>
            <input
              ref={skillFileRef}
              type="file"
              accept=".zip,application/zip"
              hidden
              onChange={event => {
                const file = event.target.files?.[0];
                if (file) void importSkill(file);
              }}
            />
          </Space>
          <Input.TextArea
            value={input}
            onChange={event => setInput(event.target.value)}
            onPressEnter={event => {
              if (!event.shiftKey) {
                event.preventDefault();
                void send();
              }
            }}
            autoSize={{ minRows: 2, maxRows: 5 }}
            placeholder="例如：这个画布下一步怎么用？检查一下 MCP 登录"
            disabled={loading}
          />
          <Button
            block
            type="primary"
            icon={<SendOutlined />}
            disabled={!input.trim()}
            loading={loading}
            onClick={() => void send()}
            style={{ marginTop: 8 }}
          >
            发送
          </Button>
          <Typography.Text type="secondary" style={{ display: 'block', marginTop: 8, fontSize: 12 }}>
            安装、配置等变更会先预览，只有你确认后才执行。
          </Typography.Text>
        </div>
      </Drawer>
    </>
  );
}
