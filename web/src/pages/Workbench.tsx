import { useEffect, useRef, useState } from 'react';
import {
  Select, Button, Input, Spin, Collapse, Typography, Empty, Space, message, Popconfirm,
} from 'antd';
import {
  PlusOutlined, SendOutlined, DeleteOutlined, RobotOutlined, UserOutlined,
} from '@ant-design/icons';
import { api } from '../api';
import { COLORS } from '../theme';
import type { Employee, SessionItem, AgentRunResponse } from '../types';

const { TextArea } = Input;
const { Text } = Typography;

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  tokenUsage?: { promptTokens: number; completionTokens: number; totalTokens: number } | null;
  traces?: { toolName: string; arguments: string | null; result: string | null; success: boolean }[];
}

export default function Workbench() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const msgEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.listAgentEmployees().then(setEmployees).catch((e: any) => message.error(e.message));
  }, []);

  useEffect(() => {
    if (!selectedEmployee) { setSessions([]); return; }
    setSessionsLoading(true);
    api.listSessions(selectedEmployee)
      .then(setSessions)
      .catch((e: any) => message.error(e.message))
      .finally(() => setSessionsLoading(false));
  }, [selectedEmployee]);

  useEffect(() => {
    msgEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSelectEmployee = (key: string) => {
    setSelectedEmployee(key);
    setSessionId(null);
    setMessages([]);
  };

  const handleNewChat = () => { setSessionId(null); setMessages([]); };

  const handleLoadSession = (session: SessionItem) => {
    setSessionId(session.sessionId);
    setMessages(
      session.messages.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
        timestamp: m.timestamp,
      })),
    );
  };

  const handleDeleteSession = async (sid: string) => {
    try {
      await api.deleteSession(sid);
      setSessions((prev) => prev.filter((s) => s.sessionId !== sid));
      if (sessionId === sid) { setSessionId(null); setMessages([]); }
      message.success('已删除');
    } catch (e: any) { message.error(e.message); }
  };

  const handleSend = async () => {
    const text = inputValue.trim();
    if (!text || !selectedEmployee) return;
    const userMsg: ChatMessage = { role: 'user', content: text, timestamp: new Date().toISOString() };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setLoading(true);
    try {
      const res: AgentRunResponse = await api.runAgent({
        employeeKey: selectedEmployee,
        userInput: text,
        sessionId: sessionId || undefined,
      });
      const assistantMsg: ChatMessage = {
        role: 'assistant', content: res.assistantMessage,
        timestamp: new Date().toISOString(),
        tokenUsage: res.tokenUsage,
        traces: res.traces?.length ? res.traces : undefined,
      };
      setMessages((prev) => [...prev, assistantMsg]);
      if (res.sessionId) {
        setSessionId(res.sessionId);
        if (selectedEmployee) api.listSessions(selectedEmployee).then(setSessions).catch(() => {});
      }
    } catch (e: any) { message.error(e.message); }
    finally { setLoading(false); }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const formatTime = (ts: string) => {
    try {
      const d = new Date(ts);
      const now = new Date();
      if (d.toDateString() === now.toDateString())
        return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
      return d.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
    } catch { return ts; }
  };

  const employeeName = employees.find((e) => e.employeeKey === selectedEmployee)?.name;

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 56px)', background: COLORS.canvas, borderRadius: 14, overflow: 'hidden', border: '1px solid #e8ecf4' }}>
      {/* Sidebar */}
      <div style={{
        width: 280, background: '#fff', borderRight: '1px solid #eef0f6',
        display: 'flex', flexDirection: 'column', flexShrink: 0,
      }}>
        <div style={{ padding: '16px 14px 10px' }}>
          <Select
            style={{ width: '100%', marginBottom: 8 }}
            placeholder="选择数字员工"
            value={selectedEmployee || undefined}
            onChange={handleSelectEmployee}
            options={employees.map((e) => ({ label: e.name, value: e.employeeKey }))}
            showSearch
            filterOption={(input, option) =>
              (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
            }
          />
          <Button
            type="dashed"
            icon={<PlusOutlined />}
            block
            onClick={handleNewChat}
            disabled={!selectedEmployee}
            style={{ borderRadius: 8 }}
          >
            新对话
          </Button>
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: '0 8px 8px' }}>
          {sessionsLoading ? (
            <div style={{ textAlign: 'center', padding: 24 }}><Spin /></div>
          ) : sessions.length === 0 && selectedEmployee ? (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无会话" />
          ) : (
            sessions.map((s) => {
              const isActive = s.sessionId === sessionId;
              const preview = s.messages?.[0]?.content?.slice(0, 40) || '(空会话)';
              return (
                <div
                  key={s.sessionId}
                  style={{
                    padding: '10px 12px', borderRadius: 8, cursor: 'pointer', marginBottom: 4,
                    display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
                    transition: 'background 0.15s',
                    background: isActive ? `${COLORS.iris}0a` : undefined,
                    border: isActive ? `1px solid ${COLORS.iris}20` : '1px solid transparent',
                  }}
                  onClick={() => handleLoadSession(s)}
                  onMouseEnter={(e) => { if (!isActive) (e.currentTarget as HTMLDivElement).style.background = '#f8f9fc'; }}
                  onMouseLeave={(e) => { if (!isActive) (e.currentTarget as HTMLDivElement).style.background = ''; }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#334155' }}>
                      {preview}
                    </div>
                    <div style={{ fontSize: 11, color: COLORS.slate, marginTop: 2 }}>
                      {formatTime(s.lastActiveAt || s.createdAt)}
                    </div>
                  </div>
                  <Popconfirm
                    title="确定删除此会话？"
                    onConfirm={(e) => { e?.stopPropagation(); handleDeleteSession(s.sessionId); }}
                    onCancel={(e) => e?.stopPropagation()}
                    okText="删除" cancelText="取消"
                  >
                    <Button
                      type="text" size="small" icon={<DeleteOutlined />}
                      onClick={(e) => e.stopPropagation()}
                      style={{ color: '#cbd5e1', flexShrink: 0 }}
                    />
                  </Popconfirm>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main chat */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {!selectedEmployee ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Empty description="选择一个数字员工开始对话" />
          </div>
        ) : messages.length === 0 && !loading ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: 56, height: 56, borderRadius: 16,
                background: `${COLORS.iris}10`, color: COLORS.iris,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 24, margin: '0 auto 16px',
              }}>
                <RobotOutlined />
              </div>
              <div style={{ fontSize: 16, fontWeight: 600, color: '#334155' }}>
                {employeeName || selectedEmployee}
              </div>
              <div style={{ fontSize: 13, color: COLORS.slate, marginTop: 4 }}>
                输入消息开始对话
              </div>
            </div>
          </div>
        ) : (
          <div style={{ flex: 1, overflow: 'auto', padding: '20px 28px' }}>
            {messages.map((msg, i) => {
              const isUser = msg.role === 'user';
              return (
                <div key={i}>
                  <div style={{
                    display: 'flex', marginBottom: 16,
                    justifyContent: isUser ? 'flex-end' : 'flex-start',
                  }}>
                    {!isUser && (
                      <div style={{
                        width: 34, height: 34, borderRadius: 10, marginRight: 10, flexShrink: 0,
                        background: `${COLORS.iris}10`, color: COLORS.iris,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15,
                      }}>
                        <RobotOutlined />
                      </div>
                    )}
                    <div style={{
                      maxWidth: '70%', padding: '10px 16px', fontSize: 14, lineHeight: '22px',
                      whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                      borderRadius: isUser ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                      background: isUser ? COLORS.iris : '#fff',
                      color: isUser ? '#fff' : '#334155',
                      border: isUser ? 'none' : '1px solid #eef0f6',
                      boxShadow: isUser ? '0 2px 8px rgba(99,102,241,0.2)' : '0 1px 3px rgba(0,0,0,0.03)',
                    }}>
                      {msg.content}
                    </div>
                    {isUser && (
                      <div style={{
                        width: 34, height: 34, borderRadius: 10, marginLeft: 10, flexShrink: 0,
                        background: `${COLORS.iris}15`, color: COLORS.iris,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15,
                      }}>
                        <UserOutlined />
                      </div>
                    )}
                  </div>
                  {!isUser && msg.tokenUsage && (
                    <div style={{ marginLeft: 44, marginBottom: 4 }}>
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        Token: {msg.tokenUsage.promptTokens} + {msg.tokenUsage.completionTokens} = {msg.tokenUsage.totalTokens}
                      </Text>
                    </div>
                  )}
                  {!isUser && msg.traces && msg.traces.length > 0 && (
                    <div style={{ marginLeft: 44, marginBottom: 12, maxWidth: '70%' }}>
                      <Collapse
                        size="small"
                        items={[{
                          key: 'traces',
                          label: <Text type="secondary" style={{ fontSize: 12 }}>工具调用 ({msg.traces.length})</Text>,
                          children: (
                            <div>
                              {msg.traces.map((t, ti) => (
                                <div key={ti} style={{
                                  padding: '6px 0',
                                  borderBottom: ti < msg.traces!.length - 1 ? '1px solid #f5f5f8' : 'none',
                                }}>
                                  <Space size={4}>
                                    <Text strong style={{ fontSize: 12 }}>{t.toolName}</Text>
                                    <Text type={t.success ? 'success' : 'danger'} style={{ fontSize: 11 }}>
                                      {t.success ? '成功' : '失败'}
                                    </Text>
                                  </Space>
                                  {t.arguments && (
                                    <div style={{
                                      fontSize: 11, color: '#64748b', marginTop: 2,
                                      background: '#f8f9fc', padding: '4px 8px', borderRadius: 6,
                                      maxHeight: 80, overflow: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-all',
                                    }}>
                                      {t.arguments}
                                    </div>
                                  )}
                                  {t.result && (
                                    <div style={{
                                      fontSize: 11, color: '#64748b', marginTop: 2,
                                      background: '#f0fdf4', padding: '4px 8px', borderRadius: 6,
                                      maxHeight: 80, overflow: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-all',
                                    }}>
                                      {t.result}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ),
                        }]}
                      />
                    </div>
                  )}
                </div>
              );
            })}
            {loading && (
              <div style={{ display: 'flex', marginBottom: 16, justifyContent: 'flex-start' }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 10, marginRight: 10, flexShrink: 0,
                  background: `${COLORS.iris}10`, color: COLORS.iris,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15,
                }}>
                  <RobotOutlined />
                </div>
                <div style={{
                  padding: '12px 16px', borderRadius: '14px 14px 14px 4px',
                  background: '#fff', border: '1px solid #eef0f6',
                }}>
                  <Spin size="small" /> <Text type="secondary" style={{ marginLeft: 6 }}>思考中...</Text>
                </div>
              </div>
            )}
            <div ref={msgEndRef} />
          </div>
        )}

        <div style={{
          padding: '14px 28px 18px', background: '#fff', borderTop: '1px solid #eef0f6',
          display: 'flex', gap: 12, alignItems: 'flex-end',
        }}>
          <TextArea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={selectedEmployee ? '输入消息，Enter 发送，Shift+Enter 换行' : '请先选择数字员工'}
            autoSize={{ minRows: 1, maxRows: 6 }}
            disabled={!selectedEmployee || loading}
            style={{ flex: 1, borderRadius: 10 }}
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handleSend}
            loading={loading}
            disabled={!selectedEmployee || !inputValue.trim()}
            style={{ borderRadius: 10, height: 38 }}
          >
            发送
          </Button>
        </div>
      </div>
    </div>
  );
}
