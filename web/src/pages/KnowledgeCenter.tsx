// 一人工作室知识中心：聚合真实知识覆盖与现有入口，不伪造尚未落地的正典/审核状态。
import { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Card, Col, Empty, List, Row, Space, Spin, Statistic, Tag, Typography } from 'antd';
import {
  BulbOutlined,
  ReadOutlined,
  RobotOutlined,
  ShareAltOutlined,
  TeamOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

import { api } from '../api';
import { useResponsive } from '../hooks/useResponsive';
import { COLORS } from '../theme';
import type { Employee, KnowledgeDocument } from '../types';

const { Text, Title } = Typography;

type EmployeeKnowledge = {
  employee: Employee;
  docs: KnowledgeDocument[];
};

const actionCards = [
  { title: '专业方法', description: '给数字员工上传岗位 SOP、方法和参考资料', path: '/employees', icon: <TeamOutlined /> },
  { title: '文章学习', description: '把指定网页整理成知识文档，并标记为外部来源', path: '/article-learn', icon: <ReadOutlined /> },
  { title: '提示词采集', description: '维护自动采集源，批量沉淀可复用提示词', path: '/auto-learn', icon: <ThunderboltOutlined /> },
  { title: 'Agent 记忆', description: '查看用户偏好、成功经验和行为纠正', path: '/memory', icon: <BulbOutlined /> },
  { title: '能力关系图', description: '查看员工、技能、工具、团队和工作流之间的关系', path: '/knowledge-graph', icon: <ShareAltOutlined /> },
];

export default function KnowledgeCenter() {
  const navigate = useNavigate();
  const { isMobile } = useResponsive();
  const [loading, setLoading] = useState(true);
  const [coverage, setCoverage] = useState<EmployeeKnowledge[]>([]);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const employees = await api.listEmployees();
        const results = await Promise.allSettled(
          employees.map(async (employee) => ({
            employee,
            docs: await api.listKnowledge(employee.employeeKey),
          })),
        );
        if (!active) return;
        setCoverage(
          results
            .filter((result): result is PromiseFulfilledResult<EmployeeKnowledge> => result.status === 'fulfilled')
            .map((result) => result.value),
        );
        setLoadFailed(results.some((result) => result.status === 'rejected'));
      } catch {
        if (active) setLoadFailed(true);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const allDocs = useMemo(
    () => coverage
      .flatMap(({ employee, docs }) => docs.map((doc) => ({ employee, doc })))
      .sort((a, b) => Date.parse(b.doc.uploadedAt) - Date.parse(a.doc.uploadedAt)),
    [coverage],
  );
  const indexed = allDocs.filter(({ doc }) => doc.indexStatus === 'indexed').length;
  const degraded = allDocs.filter(({ doc }) => doc.indexStatus === 'degraded').length;
  const employeesWithDocs = coverage.filter(({ docs }) => docs.length > 0).length;

  return (
    <div>
      <div style={{ marginBottom: isMobile ? 14 : 22 }}>
        <Space align="center">
          <RobotOutlined style={{ color: COLORS.iris, fontSize: 24 }} />
          <Title level={2} style={{ margin: 0 }}>知识中心</Title>
        </Space>
        <div style={{ marginTop: 6 }}>
          <Text type="secondary">一个入口管理专业方法、外部学习、自动采集和 Agent 记忆</Text>
        </div>
      </div>

      <Alert
        type="info"
        showIcon
        message="最简用法：先维护项目设定，再按岗位补方法资料，最后让 Agent 在生产中按需检索。"
        description="项目正典的独立空间仍在规划中；当前以制作项目的原始内容和已审批上游卡片为准，不要复制到员工角色描述或记忆库。"
        style={{ marginBottom: 18 }}
      />

      {loadFailed && (
        <Alert type="warning" showIcon message="部分知识统计暂时无法读取，快捷入口仍可正常使用。" style={{ marginBottom: 18 }} />
      )}

      <Spin spinning={loading}>
        <Row gutter={[12, 12]} style={{ marginBottom: 18 }}>
          <Col xs={12} md={6}><Card><Statistic title="知识文档" value={allDocs.length} /></Card></Col>
          <Col xs={12} md={6}><Card><Statistic title="已有知识的员工" value={employeesWithDocs} suffix={`/ ${coverage.length}`} /></Card></Col>
          <Col xs={12} md={6}><Card><Statistic title="已语义索引文档" value={indexed} /></Card></Col>
          <Col xs={12} md={6}><Card><Statistic title="关键词降级" value={degraded} valueStyle={{ color: degraded ? '#d97706' : undefined }} /></Card></Col>
        </Row>

        <Row gutter={[14, 14]} style={{ marginBottom: 20 }}>
          {actionCards.map((item) => (
            <Col xs={24} sm={12} lg={8} key={item.path}>
              <Card hoverable onClick={() => navigate(item.path)} style={{ height: '100%' }}>
                <Space align="start">
                  <div style={{ color: COLORS.iris, fontSize: 22 }}>{item.icon}</div>
                  <div>
                    <div style={{ fontWeight: 650, marginBottom: 4 }}>{item.title}</div>
                    <Text type="secondary">{item.description}</Text>
                  </div>
                </Space>
              </Card>
            </Col>
          ))}
          <Col xs={24} sm={12} lg={8}>
            <Card style={{ height: '100%', background: '#fafafa' }}>
              <Space align="start">
                <ReadOutlined style={{ color: COLORS.slate, fontSize: 22 }} />
                <div>
                  <Space><span style={{ fontWeight: 650 }}>项目正典</span><Tag>规划中</Tag></Space>
                  <div><Text type="secondary">未来集中管理角色、场景、风格和不可冲突的项目事实</Text></div>
                </div>
              </Space>
            </Card>
          </Col>
        </Row>

        <Row gutter={[14, 14]}>
          <Col xs={24} lg={10}>
            <Card title="一人团队每周只做三件事" style={{ height: '100%' }}>
              <List
                dataSource={[
                  '项目启动时：确定核心设定，避免在多个员工角色描述里复制全文。',
                  '生产过程中：只处理新资料和明确冲突，普通参考资料批量加入。',
                  '每周收尾时：花 30 分钟清理降级索引、重复记忆和过期资料。',
                ]}
                renderItem={(item, index) => <List.Item><Text><Tag color="blue">{index + 1}</Tag>{item}</Text></List.Item>}
              />
              <Button type="primary" onClick={() => navigate('/employees')}>管理员工知识</Button>
            </Card>
          </Col>
          <Col xs={24} lg={14}>
            <Card title="最近知识文档" style={{ height: '100%' }}>
              {allDocs.length === 0 && !loading ? (
                <Empty description="还没有知识文档" />
              ) : (
                <List
                  dataSource={allDocs.slice(0, 6)}
                  renderItem={({ employee, doc }) => (
                    <List.Item style={{ alignItems: 'flex-start', gap: 8, flexDirection: isMobile ? 'column' : 'row' }}>
                      <List.Item.Meta
                        style={{ minWidth: 0, width: '100%' }}
                        title={<span style={{ overflowWrap: 'anywhere' }}>{doc.fileName}</span>}
                        description={`${employee.name} · ${new Date(doc.uploadedAt).toLocaleString()}`}
                      />
                      <Tag style={{ flexShrink: 0 }} color={doc.indexStatus === 'indexed' ? 'success' : doc.indexStatus === 'pending' ? 'processing' : 'warning'}>
                        {doc.indexStatus === 'indexed' ? `${doc.chunkCount} 片段` : doc.indexStatus === 'pending' ? '处理中' : '关键词模式'}
                      </Tag>
                    </List.Item>
                  )}
                />
              )}
            </Card>
          </Col>
        </Row>
      </Spin>
    </div>
  );
}
