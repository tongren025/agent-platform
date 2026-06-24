import { useEffect, useMemo } from 'react';
import {
  Drawer, Form, Input, Select, InputNumber, Button, Space, Tag, Typography, Divider, Popconfirm,
} from 'antd';
import { MinusCircleOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { NODE_META } from './nodeMeta';
import type { Employee, ToolDef, WorkflowNode } from '../../types';
import { COLORS } from '../../theme';

const { TextArea } = Input;
const { Text } = Typography;

const OPS = [
  { value: 'eq', label: '等于' }, { value: 'neq', label: '不等于' },
  { value: 'contains', label: '包含' }, { value: 'notContains', label: '不包含' },
  { value: 'gt', label: '大于' }, { value: 'lt', label: '小于' },
  { value: 'gte', label: '大于等于' }, { value: 'lte', label: '小于等于' },
  { value: 'empty', label: '为空' }, { value: 'notEmpty', label: '非空' },
  { value: 'startsWith', label: '以…开头' }, { value: 'endsWith', label: '以…结尾' },
];

interface Props {
  open: boolean;
  node: WorkflowNode | null;
  allNodes: WorkflowNode[];
  employees: Employee[];
  tools: ToolDef[];
  onChange: (node: WorkflowNode) => void;
  onClose: () => void;
  onDelete: (nodeKey: string) => void;
}

export default function NodeConfigDrawer({
  open, node, allNodes, employees, tools, onChange, onClose, onDelete,
}: Props) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (node) {
      form.setFieldsValue({ name: node.name, ...node.config });
    }
  }, [node?.nodeKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // 可引用的上游变量提示（v1：所有其它节点的 .output + start 的输入字段）
  const varSuggestions = useMemo(() => {
    if (!node) return [];
    const out: string[] = [];
    const startNode = allNodes.find((n) => n.type === 'start');
    const inputs: any[] = startNode?.config?.inputs || [];
    inputs.forEach((i) => i?.name && out.push(`{{start.${i.name}}}`));
    allNodes
      .filter((n) => n.nodeKey !== node.nodeKey && n.type !== 'start' && n.type !== 'end')
      .forEach((n) => out.push(`{{${n.nodeKey}.output}}`));
    return out;
  }, [allNodes, node?.nodeKey]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!node) return null;
  const meta = NODE_META[node.type];

  const pushUp = () => {
    const v = form.getFieldsValue();
    const { name, ...config } = v;
    onChange({ ...node, name: name || '', config });
  };

  const appendVar = (field: string, token: string) => {
    const cur = form.getFieldValue(field) || '';
    form.setFieldValue(field, `${cur}${token}`);
    pushUp();
  };

  const VarChips = ({ field }: { field: string }) => (
    varSuggestions.length > 0 ? (
      <div style={{ marginTop: 6 }}>
        <Text type="secondary" style={{ fontSize: 11, marginRight: 4 }}>插入变量：</Text>
        {varSuggestions.map((v) => (
          <Tag
            key={v}
            onClick={() => appendVar(field, v)}
            style={{ cursor: 'pointer', fontSize: 11, marginBottom: 4, background: `${COLORS.iris}10`, border: `1px solid ${COLORS.iris}30`, color: COLORS.iris }}
          >
            {v}
          </Tag>
        ))}
      </div>
    ) : null
  );

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width={420}
      title={
        <Space>
          <span>{meta.icon}</span>
          <span>{meta.label}节点配置</span>
        </Space>
      }
      extra={
        node.type !== 'start' && node.type !== 'end' ? (
          <Popconfirm title="删除此节点？" onConfirm={() => onDelete(node.nodeKey)} okText="删除" cancelText="取消">
            <Button danger size="small" icon={<DeleteOutlined />}>删除节点</Button>
          </Popconfirm>
        ) : null
      }
    >
      <Form form={form} layout="vertical" onValuesChange={pushUp}>
        <Form.Item label="节点名称" name="name">
          <Input placeholder={meta.label} />
        </Form.Item>
        <Text type="secondary" style={{ fontSize: 12 }}>节点标识：<code>{node.nodeKey}</code></Text>
        <Divider style={{ margin: '14px 0' }} />

        {node.type === 'start' && (
          <Form.List name="inputs">
            {(fields, { add, remove }) => (
              <>
                <Text strong style={{ fontSize: 13 }}>输入字段</Text>
                <div style={{ marginTop: 8 }}>
                  {fields.map(({ key, name, ...rest }) => (
                    <Space key={key} align="baseline" style={{ display: 'flex', marginBottom: 8 }}>
                      <Form.Item {...rest} name={[name, 'name']} noStyle rules={[{ required: true, message: '字段名' }]}>
                        <Input placeholder="字段名 如 topic" />
                      </Form.Item>
                      <Form.Item {...rest} name={[name, 'label']} noStyle>
                        <Input placeholder="显示名（可选）" />
                      </Form.Item>
                      <MinusCircleOutlined onClick={() => remove(name)} style={{ color: COLORS.slate }} />
                    </Space>
                  ))}
                  <Button type="dashed" onClick={() => add({ name: '', label: '' })} block icon={<PlusOutlined />}>
                    添加输入字段
                  </Button>
                </div>
              </>
            )}
          </Form.List>
        )}

        {node.type === 'agent' && (
          <>
            <Form.Item label="数字员工" name="employeeKey" rules={[{ required: true, message: '请选择员工' }]}>
              <Select
                showSearch optionFilterProp="label" placeholder="选择一个数字员工"
                options={employees.map((e) => ({ label: `${e.name} (${e.employeeKey})`, value: e.employeeKey }))}
              />
            </Form.Item>
            <Form.Item label="输入提示词（支持 {{变量}}）" name="userInputTemplate">
              <TextArea rows={5} placeholder="把上游结果拼进来，例如：请基于以下大纲创作：{{start.topic}}" />
            </Form.Item>
            <VarChips field="userInputTemplate" />
            <Form.Item label="结构化输出 Schema（可选 JSON）" name="structuredSchemaJson" style={{ marginTop: 14 }}>
              <TextArea rows={2} placeholder='留空则自由文本；填 JSON Schema 可让 {{node.字段}} 取到结构化字段' />
            </Form.Item>
            <Form.Item label="出错时" name="onError">
              <Select allowClear placeholder="stop（默认，中止）" options={[
                { value: 'stop', label: 'stop — 中止整个工作流' },
                { value: 'continue', label: 'continue — 跳过并继续（fail-open）' },
              ]} />
            </Form.Item>
          </>
        )}

        {node.type === 'knowledge' && (
          <>
            <Form.Item label="检索哪个员工的知识库" name="employeeKey" rules={[{ required: true }]}>
              <Select
                showSearch optionFilterProp="label" placeholder="选择员工"
                options={employees.map((e) => ({ label: `${e.name} (${e.employeeKey})`, value: e.employeeKey }))}
              />
            </Form.Item>
            <Form.Item label="检索词（支持 {{变量}}）" name="queryTemplate">
              <TextArea rows={3} placeholder="{{start.topic}}" />
            </Form.Item>
            <VarChips field="queryTemplate" />
            <Form.Item label="返回片段数 topK" name="topK" style={{ marginTop: 14 }}>
              <InputNumber min={1} max={20} style={{ width: '100%' }} />
            </Form.Item>
          </>
        )}

        {node.type === 'condition' && (
          <>
            <Form.List name="cases">
              {(fields, { add, remove }) => (
                <>
                  <Text strong style={{ fontSize: 13 }}>条件分支（按顺序匹配，命中即走该出口）</Text>
                  <div style={{ marginTop: 8 }}>
                    {fields.map(({ key, name, ...rest }) => (
                      <div key={key} style={{ border: '1px solid #f0f1f5', borderRadius: 8, padding: 10, marginBottom: 10 }}>
                        <Form.Item {...rest} name={[name, 'label']} noStyle rules={[{ required: true, message: '出口标签' }]}>
                          <Input placeholder="出口标签 如 hit" style={{ marginBottom: 6 }} />
                        </Form.Item>
                        <Form.Item {...rest} name={[name, 'var']} noStyle>
                          <Input placeholder="左值 如 {{classify.output}}" style={{ marginBottom: 6 }} />
                        </Form.Item>
                        <Space.Compact style={{ width: '100%' }}>
                          <Form.Item {...rest} name={[name, 'op']} noStyle initialValue="eq">
                            <Select options={OPS} style={{ width: 130 }} />
                          </Form.Item>
                          <Form.Item {...rest} name={[name, 'value']} noStyle>
                            <Input placeholder="右值（与左值比较）" />
                          </Form.Item>
                        </Space.Compact>
                        <Button type="text" danger size="small" icon={<MinusCircleOutlined />} onClick={() => remove(name)} style={{ marginTop: 4 }}>
                          删除分支
                        </Button>
                      </div>
                    ))}
                    <Button type="dashed" onClick={() => add({ op: 'eq' })} block icon={<PlusOutlined />}>添加分支</Button>
                  </div>
                </>
              )}
            </Form.List>
            <Form.Item label="兜底出口标签（都不匹配时）" name="elseLabel" style={{ marginTop: 14 }} initialValue="else">
              <Input placeholder="else" />
            </Form.Item>
          </>
        )}

        {node.type === 'template' && (
          <>
            <Form.Item label="模板内容（支持 {{变量}}）" name="template">
              <TextArea rows={8} placeholder="把多个上游结果拼成一段文本，例如：\n编剧稿：{{writer.output}}\n分镜：{{storyboard.output}}" />
            </Form.Item>
            <VarChips field="template" />
          </>
        )}

        {node.type === 'tool' && (
          <>
            <Form.Item
              label="授权员工" name="employeeKey" rules={[{ required: true, message: '请选择授权员工' }]}
              extra="工具以该员工身份调用，且必须是该员工已绑定的工具（出于安全，工作流不能调用未授权的工具）"
            >
              <Select
                showSearch optionFilterProp="label" placeholder="选择授权该工具的员工"
                options={employees.map((e) => ({ label: `${e.name} (${e.employeeKey})`, value: e.employeeKey }))}
              />
            </Form.Item>
            <Form.Item label="工具" name="toolCode" rules={[{ required: true }]}>
              <Select
                showSearch optionFilterProp="label" placeholder="选择已注册的工具"
                options={tools.map((t) => ({ label: `${t.name} (${t.toolCode})`, value: t.toolCode }))}
              />
            </Form.Item>
            <Form.Item label="参数模板（JSON，支持 {{变量}}）" name="argsTemplate">
              <TextArea rows={6} placeholder='{"query": "{{start.topic}}"}' />
            </Form.Item>
            <VarChips field="argsTemplate" />
          </>
        )}

        {node.type === 'end' && (
          <>
            <Form.Item label="最终输出模板（支持 {{变量}}）" name="outputTemplate">
              <TextArea rows={6} placeholder="留空则取上一个节点输出。例如：{{compose.output}}" />
            </Form.Item>
            <VarChips field="outputTemplate" />
          </>
        )}
      </Form>
    </Drawer>
  );
}
