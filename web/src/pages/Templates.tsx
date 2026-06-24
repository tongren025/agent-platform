import { useEffect, useState } from 'react';
import { Card, Row, Col, Tag, Button, Modal, Form, Input, Spin, Empty, message, Space } from 'antd';
import type { RoleTemplate } from '../types';
import { api } from '../api';

const categoryColors: Record<string, string> = {
  '通用': 'blue',
  '客服': 'green',
  '营销': 'orange',
  '技术': 'purple',
  '运营': 'cyan',
  '管理': 'red',
};

function Templates() {
  const [templates, setTemplates] = useState<RoleTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentCode, setCurrentCode] = useState('');
  const [applying, setApplying] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    api.listTemplates()
      .then((data) => setTemplates(data ?? []))
      .catch(() => message.error('加载模板列表失败'))
      .finally(() => setLoading(false));
  }, []);

  const grouped = templates.reduce<Record<string, RoleTemplate[]>>((acc, t) => {
    const cat = t.category || '未分类';
    (acc[cat] ??= []).push(t);
    return acc;
  }, {});

  const handleApply = (code: string) => {
    setCurrentCode(code);
    form.resetFields();
    setModalOpen(true);
  };

  const handleConfirm = async () => {
    try {
      const values = await form.validateFields();
      setApplying(true);
      await api.applyTemplate(currentCode, values.employeeKey, values.employeeName);
      message.success('模板应用成功');
      setModalOpen(false);
    } catch (err: any) {
      if (err?.errorFields) return;
      message.error(err?.message || '模板应用失败');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return <Spin size="large" style={{ display: 'block', margin: '120px auto' }} />;
  }

  if (templates.length === 0) {
    return <Empty description="暂无模板" style={{ marginTop: 120 }} />;
  }

  return (
    <div>
      {Object.entries(grouped).map(([category, items]) => (
        <div key={category} style={{ marginBottom: 32 }}>
          <h3 style={{ marginBottom: 16 }}>{category}</h3>
          <Row gutter={[16, 16]}>
            {items.map((t) => (
              <Col span={8} key={t.templateCode}>
                <Card
                  title={
                    <Space>
                      <span>{t.name}</span>
                      <Tag color={categoryColors[t.category] ?? 'default'}>{t.category}</Tag>
                    </Space>
                  }
                  extra={
                    <Button type="primary" size="small" onClick={() => handleApply(t.templateCode)}>
                      应用模板
                    </Button>
                  }
                >
                  {t.description && <p style={{ color: '#666', marginBottom: 12 }}>{t.description}</p>}
                  {t.tags.length > 0 && (
                    <div style={{ marginBottom: 8 }}>
                      {t.tags.map((tag) => (
                        <Tag key={tag}>{tag}</Tag>
                      ))}
                    </div>
                  )}
                  <Space size={[0, 4]} wrap>
                    {t.suggestedSkillCodes.map((c) => (
                      <Tag color="geekblue" key={`skill-${c}`}>{c}</Tag>
                    ))}
                    {t.suggestedToolCodes.map((c) => (
                      <Tag color="volcano" key={`tool-${c}`}>{c}</Tag>
                    ))}
                    {t.suggestedMcpServerCodes.map((c) => (
                      <Tag color="gold" key={`mcp-${c}`}>{c}</Tag>
                    ))}
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      ))}

      <Modal
        title="应用模板"
        open={modalOpen}
        onOk={handleConfirm}
        onCancel={() => setModalOpen(false)}
        confirmLoading={applying}
        okText="确认"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="employeeKey"
            label="员工标识"
            rules={[{ required: true, message: '请输入员工标识' }]}
          >
            <Input placeholder="请输入员工标识" />
          </Form.Item>
          <Form.Item
            name="employeeName"
            label="员工名称"
            rules={[{ required: true, message: '请输入员工名称' }]}
          >
            <Input placeholder="请输入员工名称" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default Templates;
