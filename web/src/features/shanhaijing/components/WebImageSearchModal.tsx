import React, { useState, useEffect } from 'react';
import {
  Modal,
  Input,
  Button,
  Radio,
  Checkbox,
  Spin,
  Alert,
  Card,
  Row,
  Col,
  Typography,
  message,
} from 'antd';
import {
  SearchOutlined,
  CloudDownloadOutlined,
  CheckCircleFilled,
  PictureOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import type { ShanhaiCharacter, WebImageResult } from '../types';
import { shanhaijingApi, toSafeImageUrl } from '../api';

const { Text, Paragraph } = Typography;

interface WebImageSearchModalProps {
  open: boolean;
  character: ShanhaiCharacter | null;
  onClose: () => void;
  onSuccess: (updatedChar?: ShanhaiCharacter) => void;
}

export const WebImageSearchModal: React.FC<WebImageSearchModalProps> = ({
  open,
  character,
  onClose,
  onSuccess,
}) => {
  const [keyword, setKeyword] = useState('');
  const [count, setCount] = useState<number>(3);
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [results, setResults] = useState<WebImageResult[]>([]);
  const [selectedUrls, setSelectedUrls] = useState<string[]>([]);
  const [mode, setMode] = useState<'append' | 'replace'>('append');

  useEffect(() => {
    if (character && open) {
      setKeyword(character.name);
      setResults([]);
      setSelectedUrls([]);
      // 自动触发一次检索
      handleSearch(character.name, 3);
    }
  }, [character, open]);

  const handleSearch = async (kw?: string, targetCount = count) => {
    const term = (kw || keyword).trim();
    if (!term) {
      message.warning('请输入要检索的角色名称或古籍关键词');
      return;
    }
    setSearching(true);
    try {
      const res = await shanhaijingApi.searchWebImages(term, targetCount);
      setResults(res.images || []);
      // 默认全选检索到的 1~3 张图片
      setSelectedUrls(res.images?.map((img) => img.url) || []);
      if (res.images?.length === 0) {
        message.info(`未从网络检索到与「${term}」匹配的公开图片，可尝试更换关键词`);
      } else {
        message.success(`成功从网上检索到 ${res.images.length} 张《山海经》相关图片！`);
      }
    } catch (err: any) {
      message.error(err?.message || '网络检索失败，请稍后重试');
    } finally {
      setSearching(false);
    }
  };

  const handleApply = async () => {
    if (!character) return;
    if (selectedUrls.length === 0) {
      message.warning('请至少勾选一张网络图片');
      return;
    }

    setSaving(true);
    try {
      const chosenImages = results.filter((img) => selectedUrls.includes(img.url));

      let finalImages = character.images || [];
      if (mode === 'replace') {
        finalImages = chosenImages.map((img, idx) => ({
          ...img,
          is_cover: idx === 0,
        }));
      } else {
        // 追加，并过滤已有相同 URL
        const existingUrls = new Set(finalImages.map((img) => img.url));
        const newToAdd = chosenImages.filter((img) => !existingUrls.has(img.url));
        finalImages = [...finalImages, ...newToAdd];
        if (finalImages.length > 0 && !finalImages.some((img) => img.is_cover)) {
          finalImages[0].is_cover = true;
        }
      }

      const updated = await shanhaijingApi.updateCharacter(character.id, {
        images: finalImages,
      });

      message.success(`已成功为角色【${character.name}】更新图鉴，当前共 ${finalImages.length} 张图片！`);
      onSuccess(updated);
      onClose();
    } catch (err: any) {
      message.error(err?.message || '保存失败，请稍后重试');
    } finally {
      setSaving(false);
    }
  };

  const toggleSelect = (url: string) => {
    if (selectedUrls.includes(url)) {
      setSelectedUrls(selectedUrls.filter((u) => u !== url));
    } else {
      setSelectedUrls([...selectedUrls, url]);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      width={780}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <CloudDownloadOutlined style={{ color: '#0284c7', fontSize: 20 }} />
          <span>从网上检索图片 · 存入【{character?.name || '山海角色'}】专栏</span>
        </div>
      }
      footer={[
        <Button key="cancel" onClick={onClose}>
          取消
        </Button>,
        <Button
          key="submit"
          type="primary"
          icon={<CheckCircleFilled />}
          loading={saving}
          disabled={selectedUrls.length === 0 || !character}
          onClick={handleApply}
          style={{ background: '#059669', borderColor: '#059669' }}
        >
          保存选中的 {selectedUrls.length} 张图片到角色专栏
        </Button>,
      ]}
    >
      <div style={{ marginBottom: 16 }}>
        <Alert
          type="info"
          showIcon
          message="网络图谱检索说明"
          description="系统实时连通中文维基百科典籍库与维基媒体共享资源（Wikimedia Commons），检索古籍版画、传世绢本与博物馆珍藏图谱，检索完成后可勾选 1~3 张图片直接存入角色专栏。"
          style={{ marginBottom: 16 }}
        />

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onPressEnter={() => handleSearch()}
            placeholder="输入神兽/角色名称（如 九尾狐、饕餮、毕方）"
            prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
            style={{ flex: 1 }}
          />

          <Radio.Group
            value={count}
            onChange={(e) => setCount(e.target.value)}
            optionType="button"
            buttonStyle="solid"
          >
            <Radio.Button value={1}>检索 1 张</Radio.Button>
            <Radio.Button value={2}>检索 2 张</Radio.Button>
            <Radio.Button value={3}>检索 3 张</Radio.Button>
          </Radio.Group>

          <Button
            type="primary"
            icon={<SearchOutlined />}
            loading={searching}
            onClick={() => handleSearch()}
          >
            网上检索
          </Button>
        </div>

        {character && (
          <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontSize: 13, color: '#64748b' }}>保存方式:</span>
            <Radio.Group value={mode} onChange={(e) => setMode(e.target.value)}>
              <Radio value="append">追加到现有图片（当前已有 {character.images?.length || 0} 张）</Radio>
              <Radio value="replace">替换为本次勾选的图片</Radio>
            </Radio.Group>
          </div>
        )}
      </div>

      {searching ? (
        <div style={{ textAlign: 'center', padding: '48px 0' }}>
          <Spin size="large" />
          <div style={{ marginTop: 12, color: '#64748b' }}>
            正在全网检索【{keyword}】的古籍插画与传世画卷...
          </div>
        </div>
      ) : results.length > 0 ? (
        <div>
          <div style={{ marginBottom: 8, fontSize: 13, color: '#475569', display: 'flex', justifyContent: 'space-between' }}>
            <span>共检索到 {results.length} 张网络画卷（已选中 {selectedUrls.length} 张）：</span>
            <Button
              type="link"
              size="small"
              onClick={() => {
                if (selectedUrls.length === results.length) {
                  setSelectedUrls([]);
                } else {
                  setSelectedUrls(results.map((r) => r.url));
                }
              }}
            >
              {selectedUrls.length === results.length ? '取消全选' : '全部勾选'}
            </Button>
          </div>

          <Row gutter={[16, 16]}>
            {results.map((img) => {
              const isSelected = selectedUrls.includes(img.url);
              return (
                <Col xs={24} sm={12} md={8} key={img.url}>
                  <Card
                    hoverable
                    onClick={() => toggleSelect(img.url)}
                    style={{
                      border: isSelected ? '2px solid #059669' : '1px solid #e2e8f0',
                      borderRadius: 8,
                      overflow: 'hidden',
                      position: 'relative',
                    }}
                    cover={
                      <div style={{ height: 160, overflow: 'hidden', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img
                          src={toSafeImageUrl(img.url)}
                          alt={img.title}
                          style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                          loading="lazy"
                        />
                      </div>
                    }
                  >
                    <div style={{ position: 'absolute', top: 8, right: 8, zIndex: 2 }}>
                      <Checkbox checked={isSelected} />
                    </div>
                    <Paragraph ellipsis={{ rows: 2 }} style={{ margin: 0, fontSize: 12, fontWeight: 500 }}>
                      {img.title}
                    </Paragraph>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
                      来源: {img.source}
                    </div>
                  </Card>
                </Col>
              );
            })}
          </Row>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '36px 0', color: '#94a3b8' }}>
          <PictureOutlined style={{ fontSize: 42, marginBottom: 8 }} />
          <div>输入角色关键词并点击“网上检索”即可自动获取 1~3 张高清古籍图录</div>
        </div>
      )}
    </Modal>
  );
};
