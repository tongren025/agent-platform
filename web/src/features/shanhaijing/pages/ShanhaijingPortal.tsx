import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Row,
  Col,
  Input,
  Select,
  Button,
  Spin,
  Empty,
  Space,
  Tag,
  Popconfirm,
  message,
} from 'antd';
import {
  CompassOutlined,
  SearchOutlined,
  PlusOutlined,
  ReloadOutlined,
  CloudDownloadOutlined,
  FireOutlined,
  BookOutlined,
  PictureOutlined,
} from '@ant-design/icons';
import type { ShanhaiCharacter, ShanhaiCategoryInfo } from '../types';
import { shanhaijingApi } from '../api';
import { CharacterCard } from '../components/CharacterCard';
import { CharacterDetailModal } from '../components/CharacterDetailModal';
import { WebImageSearchModal } from '../components/WebImageSearchModal';
import { CharacterFormModal } from '../components/CharacterFormModal';
import './ShanhaijingPortal.css';

export default function ShanhaijingPortal() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [characters, setCharacters] = useState<ShanhaiCharacter[]>([]);
  const [categoryInfo, setCategoryInfo] = useState<ShanhaiCategoryInfo | null>(null);

  // 筛选与搜索状态
  const [selectedCategory, setSelectedCategory] = useState<string>('全部');
  const [selectedMountain, setSelectedMountain] = useState<string>('全部');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 模态框控制
  const [detailChar, setDetailChar] = useState<ShanhaiCharacter | null>(null);
  const [searchImgChar, setSearchImgChar] = useState<ShanhaiCharacter | null>(null);
  const [formChar, setFormChar] = useState<ShanhaiCharacter | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [searchImgOpen, setSearchImgOpen] = useState(false);

  // 批量刷新/重置
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [charsData, catData] = await Promise.all([
        shanhaijingApi.listCharacters(),
        shanhaijingApi.getCategories(),
      ]);
      setCharacters(charsData || []);
      setCategoryInfo(catData || null);
    } catch (err: any) {
      message.error(err?.message || '加载山海经专栏数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 前端多维过滤（分类、山系、关键词）
  const filteredCharacters = useMemo(() => {
    return characters.filter((c) => {
      if (selectedCategory !== '全部' && c.category !== selectedCategory) {
        return false;
      }
      if (selectedMountain !== '全部' && !c.mountain.includes(selectedMountain)) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchName = c.name?.toLowerCase().includes(q);
        const matchPinyin = c.pinyin?.toLowerCase().includes(q);
        const matchQuote = c.classic_quote?.toLowerCase().includes(q);
        const matchDesc = c.modern_desc?.toLowerCase().includes(q);
        const matchTags = c.tags?.some((t) => t.toLowerCase().includes(q));
        if (!matchName && !matchPinyin && !matchQuote && !matchDesc && !matchTags) {
          return false;
        }
      }
      return true;
    });
  }, [characters, selectedCategory, selectedMountain, searchQuery]);

  // 总图片统计
  const totalImages = useMemo(() => {
    return characters.reduce((sum, c) => sum + (c.images?.length || 0), 0);
  }, [characters]);

  // 重置回预设典籍
  const handleResetDefaults = async () => {
    setResetting(true);
    try {
      await shanhaijingApi.resetDefaults();
      message.success('已恢复系统预设山海经 12 位典籍角色与全量图片！');
      await loadData();
    } catch (e: any) {
      message.error(e?.message || '重置失败');
    } finally {
      setResetting(false);
    }
  };

  // 删除角色
  const handleDelete = async (charId: string) => {
    try {
      await shanhaijingApi.deleteCharacter(charId);
      message.success('角色已从专栏中移除');
      setCharacters((prev) => prev.filter((c) => c.id !== charId));
    } catch (e: any) {
      message.error(e?.message || '删除失败');
    }
  };

  // 导入漫剧工作室联动
  const handleImportToStudio = (char: ShanhaiCharacter) => {
    message.success(`已提取【${char.name}】的东方神话设定，正在载入漫剧工作台...`);
    // 预载设定并路由至 Director Studio 快速制作
    navigate('/studio', {
      state: {
        shanhaiCharacter: {
          name: char.name,
          title: char.title,
          category: char.category,
          quote: char.classic_quote,
          description: char.modern_desc,
          ability: char.ability,
          referenceImages: char.images.map((img) => img.url),
        },
      },
    });
  };

  // 分类标签列表
  const categoryOptions = [
    '全部',
    '瑞兽',
    '创世神祇',
    '远古战神',
    '上古四凶',
    '神禽异鸟',
    '镇山神兽',
    '异兽',
  ];

  const mountainOptions = [
    '全部',
    '南山经',
    '西山经',
    '北山经',
    '东山经',
    '中山经',
    '海外经',
    '海内经',
    '大荒经',
  ];

  return (
    <div className="shanhai-page">
      {/* 顶部古典 Banner */}
      <div className="shanhai-hero-banner">
        <div className="shanhai-hero-badge">
          <FireOutlined /> 东方典籍 · 东方古典志怪美学专栏
        </div>
        <h1 className="shanhai-hero-title">山海经专栏 · 大荒异志录</h1>
        <p className="shanhai-hero-subtitle">
          汇聚《山海经》全卷异兽、神祇与神禽图鉴。专栏中每位角色单独建档立项，支持实时从网络检索 1~3 张古籍插画与传世画卷，并可一键将设定与形象无缝带入漫剧工作流。
        </p>

        <div className="shanhai-stats-bar">
          <div className="shanhai-stat-item">
            <span className="shanhai-stat-num">{characters.length}</span>
            <span className="shanhai-stat-label">收录独立角色</span>
          </div>
          <div className="shanhai-stat-item">
            <span className="shanhai-stat-num">{totalImages}</span>
            <span className="shanhai-stat-label">精选网络画卷</span>
          </div>
          <div className="shanhai-stat-item">
            <span className="shanhai-stat-num">{categoryOptions.length - 1}</span>
            <span className="shanhai-stat-label">神话品类划分</span>
          </div>
          <div className="shanhai-stat-item">
            <span className="shanhai-stat-num">8 大</span>
            <span className="shanhai-stat-label">经卷山系全景</span>
          </div>
        </div>
      </div>

      {/* 筛选与操作工具栏 */}
      <div className="shanhai-toolbar">
        {/* 第一行：品类切换与核心操作 */}
        <div className="shanhai-toolbar-row">
          <div className="shanhai-category-tabs">
            {categoryOptions.map((cat) => (
              <button
                type="button"
                key={cat}
                className={`shanhai-tab-btn ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
                {cat !== '全部' && categoryInfo?.stats?.category_counts?.[cat] !== undefined && (
                  <span style={{ marginLeft: 4, opacity: 0.7, fontSize: 11 }}>
                    ({categoryInfo.stats.category_counts[cat]})
                  </span>
                )}
              </button>
            ))}
          </div>

          <Space wrap>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setFormChar(null);
                setFormOpen(true);
              }}
              style={{ background: '#059669', borderColor: '#059669' }}
            >
              录入新角色
            </Button>

            <Button
              icon={<CloudDownloadOutlined />}
              style={{ color: '#0284c7', borderColor: '#0284c7' }}
              onClick={() => {
                setSearchImgChar(characters[0] || null);
                setSearchImgOpen(true);
              }}
            >
              在线全网搜图
            </Button>

            <Popconfirm
              title="确定要重置回系统预设的 12 位典籍角色与图片吗？"
              onConfirm={handleResetDefaults}
              okText="重置"
              cancelText="取消"
            >
              <Button icon={<ReloadOutlined />} loading={resetting}>
                重置预设
              </Button>
            </Popconfirm>
          </Space>
        </div>

        {/* 第二行：山系经卷筛选 + 关键词搜索 */}
        <div className="shanhai-toolbar-row">
          <Space wrap align="center">
            <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>
              <CompassOutlined style={{ marginRight: 4 }} />
              山系经卷:
            </span>
            <Select
              value={selectedMountain}
              onChange={setSelectedMountain}
              style={{ width: 140 }}
            >
              {mountainOptions.map((m) => (
                <Select.Option key={m} value={m}>
                  {m}
                </Select.Option>
              ))}
            </Select>

            <span style={{ fontSize: 13, color: '#94a3b8', marginLeft: 8 }}>
              共匹配到 <strong>{filteredCharacters.length}</strong> 位神异角色
            </span>
          </Space>

          <Input
            allowClear
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索角色名、拼音、经典语句或神职..."
            prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
            style={{ width: 280 }}
          />
        </div>
      </div>

      {/* 角色卡片列表（角色单独一项） */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <Spin size="large" />
          <div style={{ marginTop: 16, color: '#64748b' }}>正在展开山海画卷...</div>
        </div>
      ) : filteredCharacters.length > 0 ? (
        <Row gutter={[20, 20]}>
          {filteredCharacters.map((char) => (
            <Col xs={24} sm={12} md={8} lg={6} key={char.id}>
              <CharacterCard
                character={char}
                onViewDetail={(c) => setDetailChar(c)}
                onSearchImages={(c) => {
                  setSearchImgChar(c);
                  setSearchImgOpen(true);
                }}
                onImportToStudio={handleImportToStudio}
                onDelete={handleDelete}
              />
            </Col>
          ))}
        </Row>
      ) : (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="未找到符合筛选条件的山海角色"
          style={{ padding: '60px 0' }}
        >
          <Button
            onClick={() => {
              setSelectedCategory('全部');
              setSelectedMountain('全部');
              setSearchQuery('');
            }}
          >
            清除筛选条件
          </Button>
        </Empty>
      )}

      {/* 角色详考模态框 */}
      <CharacterDetailModal
        open={Boolean(detailChar)}
        character={detailChar}
        onClose={() => setDetailChar(null)}
        onSearchImages={(c) => {
          setSearchImgChar(c);
          setSearchImgOpen(true);
        }}
        onImportToStudio={handleImportToStudio}
      />

      {/* 网络检索图片模态框 */}
      <WebImageSearchModal
        open={searchImgOpen}
        character={searchImgChar}
        onClose={() => setSearchImgOpen(false)}
        onSuccess={(updatedChar) => {
          if (updatedChar) {
            setCharacters((prev) =>
              prev.map((c) => (c.id === updatedChar.id ? updatedChar : c))
            );
            if (detailChar?.id === updatedChar.id) {
              setDetailChar(updatedChar);
            }
          } else {
            loadData();
          }
        }}
      />

      {/* 角色录入与编辑模态框 */}
      <CharacterFormModal
        open={formOpen}
        character={formChar}
        onClose={() => setFormOpen(false)}
        onSuccess={(savedChar) => {
          setCharacters((prev) => {
            const exists = prev.some((c) => c.id === savedChar.id);
            if (exists) {
              return prev.map((c) => (c.id === savedChar.id ? savedChar : c));
            }
            return [savedChar, ...prev];
          });
          loadData();
        }}
      />
    </div>
  );
}
