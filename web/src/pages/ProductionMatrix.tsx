// 全链路对照矩阵：季 → 集 → G 生成单元 → 剧本/分镜/首帧/末帧/视频提示词/图/视频，一屏铺开。
//
// 制作看板按阶段竖切成 10 列，同一个 G 单元的四个环节散落在不同列里，
// 无法回答"这一集哪些单元还没图""哪个单元断链了"。本页把主键
// (季, 集, G单元) 拉成行，把阶段拉成列，缺口一眼可见。
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Tag, Segmented, Space, Typography, Spin, Empty, Tooltip, Badge, Progress, Alert, Button, Drawer, List, Modal, Popconfirm } from 'antd';
import { message } from '../ui';
import {
  FileTextOutlined, BuildOutlined, PictureOutlined, LockOutlined,
  VideoCameraOutlined, WarningOutlined, InboxOutlined, UndoOutlined,
} from '@ant-design/icons';
import { api, type MatrixProject, type MatrixRow, type OrphanCard, type ArchivedCard } from '../api';
import { useResponsive } from '../hooks/useResponsive';
import { COLORS } from '../theme';

const { Text, Title, Paragraph } = Typography;

/** 链路上的七个环节：四个 spec 阶段（含首帧/末帧拆分）+ 两个产出。 */
const CHAIN: { key: keyof MatrixRow; label: string; icon: React.ReactNode; color: string; spec: boolean }[] = [
  { key: 'script', label: '剧本', icon: <FileTextOutlined />, color: '#7c4dff', spec: true },
  { key: 'storyboard', label: '分镜', icon: <BuildOutlined />, color: '#00897b', spec: true },
  { key: 'img_prompt', label: '首帧提示词', icon: <PictureOutlined />, color: '#1e88e5', spec: true },
  { key: 'flf', label: '末帧锁', icon: <LockOutlined />, color: '#8d6e63', spec: false },
  { key: 'vid_prompt', label: '视频提示词', icon: <VideoCameraOutlined />, color: '#e53935', spec: true },
  { key: 'images', label: '图', icon: <PictureOutlined />, color: '#43a047', spec: false },
  { key: 'videos', label: '视频', icon: <VideoCameraOutlined />, color: '#fb8c00', spec: false },
];

type Filter = 'all' | 'gap' | 'noimg';

/** 单元格：有几张就显示几张，0 张时区分"该有却没有"(红叉)与"本就可选"(灰点)。 */
function Cell({ n, required }: { n: number; required: boolean }) {
  if (n > 0) {
    return <Text style={{ color: '#389e0d', fontWeight: 600 }}>{n > 1 ? `✓ ${n}` : '✓'}</Text>;
  }
  return required
    ? <Tooltip title="链路断在这里"><Text style={{ color: '#cf1322', fontWeight: 600 }}>✗</Text></Tooltip>
    : <Text type="secondary" style={{ opacity: 0.35 }}>·</Text>;
}

export default function ProductionMatrix() {
  const navigate = useNavigate();
  const { isMobile } = useResponsive();
  const [projects, setProjects] = useState<MatrixProject[]>([]);
  const [rows, setRows] = useState<MatrixRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [pid, setPid] = useState<string>('');
  const [filter, setFilter] = useState<Filter>('all');

  const [orphans, setOrphans] = useState<OrphanCard[]>([]);
  const [orphanOpen, setOrphanOpen] = useState(false);
  const [archived, setArchived] = useState<ArchivedCard[]>([]);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const reload = useCallback(async () => {
    const [m, o] = await Promise.all([api.getMatrix(), api.listOrphans()]);
    setProjects(m.projects);
    setRows(m.rows);
    setOrphans(o);
    return m;
  }, []);

  useEffect(() => {
    reload()
      .then(m => { if (m.projects.length) setPid(p => p || m.projects[0].project_id); })
      .catch(() => { /* 拉不到就显示空态 */ })
      .finally(() => setLoading(false));
  }, [reload]);

  // 归档区按项目分别存放，切季时重新拉
  useEffect(() => {
    if (!pid) return;
    api.listArchive(pid).then(setArchived).catch(() => setArchived([]));
  }, [pid]);

  const myOrphans = useMemo(() => orphans.filter(o => o.project_id === pid), [orphans, pid]);

  const refreshArchive = useCallback(async () => {
    if (pid) setArchived(await api.listArchive(pid).catch(() => []));
  }, [pid]);

  const handleArchive = async (cards: OrphanCard[]) => {
    if (!cards.length) return;
    setBusy(true);
    try {
      const reason = '孤儿卡：所属 G 单元不存在（该集无此单元的剧本/分镜/首帧/视频提示词）';
      await api.archiveCards(pid, cards.map(c => c.card_id), reason);
      message.success(`已归档 ${cards.length} 张，可随时恢复`);
      setOrphanOpen(false);
      await Promise.all([reload(), refreshArchive()]);
    } catch (e: any) { message.error('归档失败: ' + e.message); }
    finally { setBusy(false); }
  };

  const handleRestore = async (cardId: string) => {
    setBusy(true);
    try {
      await api.restoreCard(pid, cardId);
      message.success('已恢复回卡片列表');
      await Promise.all([reload(), refreshArchive()]);
    } catch (e: any) { message.error('恢复失败: ' + e.message); }
    finally { setBusy(false); }
  };

  const visible = useMemo(() => {
    let r = rows.filter(x => x.project_id === pid);
    if (filter === 'gap') r = r.filter(x => x.missing.length > 0);
    if (filter === 'noimg') r = r.filter(x => x.images === 0);
    return r;
  }, [rows, pid, filter]);

  /** 当前季的整体进度：spec 齐全率 与 出图率。 */
  const stats = useMemo(() => {
    const r = rows.filter(x => x.project_id === pid);
    if (!r.length) return null;
    return {
      units: r.length,
      episodes: new Set(r.map(x => x.episode)).size,
      specDone: r.filter(x => x.missing.length === 0).length,
      gaps: r.filter(x => x.missing.length > 0).length,
      withImg: r.filter(x => x.images > 0).length,
      withVid: r.filter(x => x.videos > 0).length,
    };
  }, [rows, pid]);

  const columns = [
    {
      title: '集', dataIndex: 'episode', width: 74, fixed: 'left' as const,
      render: (ep: number) => <Tag color="blue" style={{ margin: 0 }}>EP{String(ep).padStart(2, '0')}</Tag>,
    },
    {
      title: 'G 单元', dataIndex: 'unit', width: 76, fixed: 'left' as const,
      render: (u: number) => <Text strong>G{u}</Text>,
    },
    {
      title: '标题', dataIndex: 'title', ellipsis: true,
      render: (t: string, r: MatrixRow) => (
        <Space size={4}>
          {r.missing.length > 0 && (
            <Tooltip title={`缺：${r.missing.join('、')}`}>
              <WarningOutlined style={{ color: '#cf1322' }} />
            </Tooltip>
          )}
          <Text style={{ fontSize: 12 }}>{t || '—'}</Text>
        </Space>
      ),
    },
    ...CHAIN.map(c => ({
      title: (
        <Tooltip title={c.spec ? '必需环节，缺失即断链' : '可选/产出环节'}>
          <span style={{ color: c.color, fontSize: 12 }}>{c.icon} {c.label}</span>
        </Tooltip>
      ),
      dataIndex: c.key as string,
      width: 108,
      align: 'center' as const,
      render: (n: number) => <Cell n={n} required={c.spec} />,
    })),
  ];

  if (loading) {
    return <div style={{ padding: 80, textAlign: 'center' }}><Spin /></div>;
  }
  if (!projects.length) {
    return <div style={{ padding: 60 }}><Empty description="还没有制作项目" /></div>;
  }

  return (
    <div style={{ padding: isMobile ? 8 : 16, height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <Title level={4} style={{ margin: '0 0 4px' }}>全链路对照</Title>
      <Text type="secondary" style={{ fontSize: 12 }}>
        主键 = 季 × 集 × G 生成单元。一行走完剧本 → 分镜 → 首帧 → 视频提示词 → 成图 → 成片，断在哪里一眼可见。
      </Text>

      <Space style={{ margin: isMobile ? '8px 0 6px' : '14px 0 10px', flexWrap: 'wrap' }} wrap>
        <Segmented value={pid} onChange={v => setPid(v as string)}
          options={projects.map(p => ({
            value: p.project_id,
            label: `${p.name}（${p.episode_count} 集 / ${p.card_count} 卡）`,
          }))} />
        <Segmented value={filter} onChange={v => setFilter(v as Filter)}
          options={[
            { value: 'all', label: '全部单元' },
            { value: 'gap', label: '只看断链' },
            { value: 'noimg', label: '只看没图' },
          ]} />
        <Badge count={archived.length} size="small" offset={[-4, 4]}>
          <Button icon={<InboxOutlined />} onClick={() => setArchiveOpen(true)}>归档区</Button>
        </Badge>
      </Space>

      {myOrphans.length > 0 && (
        <Alert type="warning" showIcon style={{ marginBottom: 12 }}
          message={`发现 ${myOrphans.length} 张孤儿卡`}
          description="这些卡挂在一个不存在的 G 生成单元上——该单元的剧本 / 分镜 / 首帧提示词 / 视频提示词全都没有。它们有真实内容，不会被删除，只会移入归档区。"
          action={<Button size="small" danger onClick={() => setOrphanOpen(true)}>查看并归档</Button>} />
      )}

      {stats && (
        <Space size={20} style={{ marginBottom: 12 }} wrap>
          <span><Text type="secondary" style={{ fontSize: 12 }}>集数 </Text><Text strong>{stats.episodes}</Text></span>
          <span><Text type="secondary" style={{ fontSize: 12 }}>G 单元 </Text><Text strong>{stats.units}</Text></span>
          <span>
            <Text type="secondary" style={{ fontSize: 12 }}>四阶段齐全 </Text>
            <Text strong style={{ color: '#389e0d' }}>{stats.specDone}</Text>
            {stats.gaps > 0 && <Badge count={`断链 ${stats.gaps}`} style={{ backgroundColor: '#cf1322', marginLeft: 6 }} />}
          </span>
          <span style={{ minWidth: isMobile ? 140 : 200 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>出图进度 </Text>
            <Progress percent={Math.round(100 * stats.withImg / stats.units)} size="small"
              format={() => `${stats.withImg}/${stats.units}`} style={{ width: isMobile ? 100 : 150 }}
              strokeColor={stats.withImg === 0 ? '#d9d9d9' : COLORS.iris} />
          </span>
        </Space>
      )}

      <div style={{ flex: 1, minHeight: 0, overflowX: 'auto' }}>
        <Table<MatrixRow>
          rowKey={r => `${r.project_id}-${r.episode}-${r.unit}`}
          dataSource={visible}
          columns={columns}
          size="small"
          pagination={false}
          virtual
          scroll={{ x: 1080, y: Math.max(300, window.innerHeight - (isMobile ? 400 : 340)) }}
          onRow={r => ({
            style: { cursor: 'pointer' },
            onClick: () => navigate(`/production/${r.project_id}/ep/${r.episode}`),
          })}
          locale={{ emptyText: filter === 'gap' ? '没有断链的单元 🎉' : filter === 'noimg' ? '所有单元都有图 🎉' : '无数据' }}
        />
      </div>

      {/* 孤儿卡：先看清内容再决定归档，绝不静默移动 */}
      <Modal title={`孤儿卡（${myOrphans.length}）`} open={orphanOpen} width={isMobile ? '100%' : 720}
        onCancel={() => setOrphanOpen(false)}
        footer={[
          <Button key="c" onClick={() => setOrphanOpen(false)}>取消</Button>,
          <Popconfirm key="a" title={`归档这 ${myOrphans.length} 张卡？`}
            description="卡片移入 archive/ 目录，内容原样保留，可随时恢复。"
            onConfirm={() => handleArchive(myOrphans)} okText="归档" cancelText="再想想">
            <Button type="primary" loading={busy} icon={<InboxOutlined />}>全部归档</Button>
          </Popconfirm>,
        ]}>
        <List dataSource={myOrphans} rowKey={o => o.card_id}
          renderItem={o => (
            <List.Item>
              <div style={{ width: '100%' }}>
                <Space size={6} wrap>
                  <Tag color="blue">EP{String(o.episode).padStart(2, '0')}</Tag>
                  <Tag color="red">G{o.shot_number}（该单元不存在）</Tag>
                  <Tag>{o.stage}</Tag>
                  <Text strong style={{ fontSize: 13 }}>{o.title}</Text>
                </Space>
                <div style={{ marginTop: 4 }}>
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    该集实际只有 G{o.episode_units.join('、G')} —— 疑似编号错位或该单元从未写完
                  </Text>
                </div>
                <Paragraph type="secondary" ellipsis={{ rows: 2 }}
                  style={{ fontSize: 11, margin: '6px 0 0', background: '#fafafa', padding: 8, borderRadius: 6 }}>
                  {o.content}
                </Paragraph>
              </div>
            </List.Item>
          )} />
      </Modal>

      {/* 归档区：永不删除，一卡一文件存在 data/production/<pid>/archive/ */}
      <Drawer title={`归档区 · ${projects.find(p => p.project_id === pid)?.name || ''}`}
        open={archiveOpen} onClose={() => setArchiveOpen(false)} width={isMobile ? '100%' : 560}>
        <Text type="secondary" style={{ fontSize: 12 }}>
          归档不是删除。卡片以 <Text code>data/production/{pid}/archive/&lt;card_id&gt;.json</Text> 原样保存，随时可恢复。
        </Text>
        <List style={{ marginTop: 12 }} dataSource={archived} rowKey={a => a.card_id}
          locale={{ emptyText: '归档区是空的' }}
          renderItem={a => (
            <List.Item actions={[
              <Button key="r" size="small" icon={<UndoOutlined />} loading={busy}
                onClick={() => handleRestore(a.card_id)}>恢复</Button>,
            ]}>
              <List.Item.Meta
                title={<Space size={6} wrap>
                  {a.episode != null && <Tag color="blue">EP{String(a.episode).padStart(2, '0')}</Tag>}
                  <Tag color="red">G{a.shot_number}</Tag>
                  <Text strong style={{ fontSize: 13 }}>{a.title}</Text>
                </Space>}
                description={<>
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    {a.archived_at.slice(0, 19).replace('T', ' ')} · {a.archive_reason}
                  </Text>
                  <Paragraph type="secondary" ellipsis={{ rows: 2 }}
                    style={{ fontSize: 11, margin: '6px 0 0' }}>{a.content}</Paragraph>
                </>} />
            </List.Item>
          )} />
      </Drawer>
    </div>
  );
}
