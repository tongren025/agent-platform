import { useEffect, useState } from 'react';
import { Card, Col, Row, Spin, Statistic, message } from 'antd';
import {
  TeamOutlined,
  ApartmentOutlined,
  PartitionOutlined,
  ToolOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';
import { adminApi, type AdminOverview } from '../../adminApi';
import { COLORS } from '../../theme';

export default function AdminDashboard() {
  const [data, setData] = useState<AdminOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi
      .overview()
      .then(setData)
      .catch((e) => message.error(e.message || '加载失败'))
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    { title: '数字员工', value: data?.employees, icon: <TeamOutlined />, color: COLORS.iris,
      suffix: data ? `(启用 ${data.employeesEnabled} / 停用 ${data.employeesDisabled})` : undefined },
    { title: '团队', value: data?.teams, icon: <ApartmentOutlined />, color: COLORS.mint },
    { title: '工作流', value: data?.workflows, icon: <PartitionOutlined />, color: COLORS.irisLight },
    { title: '工具', value: data?.tools, icon: <ToolOutlined />, color: COLORS.slate },
    { title: '技能', value: data?.skills, icon: <AppstoreOutlined />, color: COLORS.rose },
    { title: 'MCP 服务', value: data?.mcpServers, icon: <ToolOutlined />, color: COLORS.slateDark },
    { title: '角色模板', value: data?.roleTemplates, icon: <AppstoreOutlined />, color: COLORS.iris },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: COLORS.slateDark }}>系统总览</h1>
        <div style={{ color: COLORS.slate, fontSize: 14, marginTop: 4 }}>
          管理员视角的平台资源概况
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 80 }}>
          <Spin size="large" />
        </div>
      ) : (
        <Row gutter={[16, 16]}>
          {cards.map((c) => (
            <Col xs={24} sm={12} lg={8} key={c.title}>
              <Card>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      background: `${c.color}1a`,
                      color: c.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 22,
                    }}
                  >
                    {c.icon}
                  </div>
                  <div>
                    <Statistic title={c.title} value={c.value ?? 0} />
                    {c.suffix && (
                      <div style={{ fontSize: 12, color: COLORS.slate, marginTop: 2 }}>{c.suffix}</div>
                    )}
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
}
