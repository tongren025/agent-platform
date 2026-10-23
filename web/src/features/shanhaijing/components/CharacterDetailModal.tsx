import React, { useEffect, useState } from 'react';
import { Modal, Tag, Button, Divider, Image, Typography, message } from 'antd';
import {
  CompassOutlined,
  CloudDownloadOutlined,
  VideoCameraOutlined,
  PictureOutlined,
  BookOutlined,
  ThunderboltOutlined,
  CopyOutlined,
  FireOutlined,
} from '@ant-design/icons';
import type { ShanhaiCharacter } from '../types';
import { toSafeImageUrl } from '../api';
import { CharacterSources } from './CharacterSources';
import type { ReadingTarget } from './OriginalTextLibrary';

const { Paragraph, Text } = Typography;

interface CharacterDetailModalProps {
  character: ShanhaiCharacter | null;
  open: boolean;
  onClose: () => void;
  onSearchImages: (char: ShanhaiCharacter) => void;
  onImportToStudio: (char: ShanhaiCharacter) => void;
  onReadSource: (target: ReadingTarget) => void;
}

export const CharacterDetailModal: React.FC<CharacterDetailModalProps> = ({
  character,
  open,
  onClose,
  onSearchImages,
  onImportToStudio,
  onReadSource,
}) => {
  const [selectedImgIdx, setSelectedImgIdx] = useState(0);
  useEffect(() => {
    setSelectedImgIdx(0);
  }, [character?.id]);
  if (!character) return null;
  const images = character.images || [];

  const activeImg = images[selectedImgIdx] || images[0];

  return (
    <Modal
      open={open}
      onCancel={onClose}
      width={860}
      footer={[
        <Button key="close" onClick={onClose}>
          关闭
        </Button>,
        <Button
          key="search"
          icon={<CloudDownloadOutlined />}
          style={{ color: '#0284c7', borderColor: '#0284c7' }}
          onClick={() => {
            onClose();
            onSearchImages(character);
          }}
        >
          从网上检索更多图片
        </Button>,
        <Button
          key="studio"
          type="primary"
          icon={<VideoCameraOutlined />}
          style={{ background: '#d97706', borderColor: '#d97706' }}
          onClick={() => {
            onClose();
            onImportToStudio(character);
          }}
        >
          一键带入漫剧创作
        </Button>,
      ]}
      title={
        <div className="shanhai-modal-header">
          <span className="shanhai-modal-badge">{character.category}</span>
          <span className="shanhai-modal-name">{character.name}</span>
          {character.pinyin && <span className="shanhai-modal-pinyin">({character.pinyin})</span>}
          {character.title && (
            <span className="shanhai-modal-title-suffix">· {character.title}</span>
          )}
        </div>
      }
    >
      <div className="shanhai-detail-layout">
        {/* 左侧/上方：画廊大图展示与 1~3 张网图选择器 */}
        <div className="shanhai-detail-gallery">
          <div className="shanhai-detail-main-img-wrap">
            {activeImg ? (
              <Image
                src={toSafeImageUrl(activeImg.url)}
                alt={activeImg.title || character.name}
                className="shanhai-detail-main-img"
                fallback="https://via.placeholder.com/600x400?text=图片暂不可用"
                preview={{
                  src: toSafeImageUrl(activeImg.url),
                }}
              />
            ) : (
              <div className="shanhai-detail-no-img">
                <PictureOutlined style={{ fontSize: 48, color: '#9ca3af' }} />
                <p>暂无图片，可点击下方按钮从网上检索 1-3 张图片</p>
              </div>
            )}
            {activeImg && (
              <div className="shanhai-detail-img-meta">
                <span className="shanhai-meta-title">{activeImg.title || '古籍插画图谱'}</span>
                <span className="shanhai-meta-source">来源: {activeImg.source || '网络检索'}</span>
              </div>
            )}
          </div>

          {/* 1~3 张图片多图缩略图列表 */}
          {images.length > 1 && (
            <div className="shanhai-detail-thumb-strip">
              {images.map((img, idx) => (
                <div
                  key={img.id || idx}
                  className={`shanhai-thumb-item ${idx === selectedImgIdx ? 'active' : ''}`}
                  onClick={() => setSelectedImgIdx(idx)}
                >
                  <img
                    src={toSafeImageUrl(img.url)}
                    alt={img.title}
                    className="shanhai-thumb-img"
                  />
                  <span className="shanhai-thumb-index">图 {idx + 1}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 右侧：典籍原文、白话考释与神力属性 */}
        <div className="shanhai-detail-info">
          {open && (
            <CharacterSources key={character.id} characterId={character.id} onRead={onReadSource} />
          )}
          <div className="shanhai-detail-section">
            <div className="shanhai-section-title">
              <BookOutlined style={{ marginRight: 6, color: '#b45309' }} />
              角色档案引文（待逐字校勘）
            </div>
            <div className="shanhai-quote-full-box">
              <div className="shanhai-mountain-origin">
                <CompassOutlined style={{ marginRight: 4 }} />
                档案标注：{character.mountain || '《山海经》大荒篇'}
              </div>
              <Paragraph className="shanhai-ancient-text">
                {character.classic_quote || '未载原文引句。'}
              </Paragraph>
            </div>
          </div>

          <div className="shanhai-detail-section" style={{ marginTop: 16 }}>
            <div className="shanhai-section-title">
              <PictureOutlined style={{ marginRight: 6, color: '#059669' }} />
              角色释义与创作设定
            </div>
            <Paragraph className="shanhai-modern-text">
              {character.modern_desc || '暂无释义考据。'}
            </Paragraph>
          </div>

          {character.ability && (
            <div className="shanhai-detail-section" style={{ marginTop: 16 }}>
              <div className="shanhai-section-title">
                <ThunderboltOutlined style={{ marginRight: 6, color: '#d97706' }} />
                神职、异能与祥凶寓意
              </div>
              <div className="shanhai-ability-box">{character.ability}</div>
            </div>
          )}

          {/* 现代短剧双重身份设定 */}
          {(character.mortal_identity || character.divine_form) && (
            <div className="shanhai-detail-section" style={{ marginTop: 16 }}>
              <div className="shanhai-section-title" style={{ color: '#7c3aed' }}>
                <VideoCameraOutlined style={{ marginRight: 6 }} />
                短剧双形态设定（白天凡人 vs 夜晚古神）
              </div>
              <div className="shanhai-detail-dual-container">
                {character.mortal_identity && (
                  <div className="shanhai-detail-dual-card mortal">
                    <div className="shanhai-detail-dual-title">
                      ☀️ 白天凡相（现代身份）
                    </div>
                    <div className="shanhai-detail-dual-content">{character.mortal_identity}</div>
                  </div>
                )}
                {character.divine_form && (
                  <div className="shanhai-detail-dual-card divine">
                    <div className="shanhai-detail-dual-title">
                      🌙 夜晚真身（洪荒古神法相）
                    </div>
                    <div className="shanhai-detail-dual-content">{character.divine_form}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 电影级漫剧出图 Prompt */}
          {character.visual_prompt && (
            <div className="shanhai-detail-section" style={{ marginTop: 16 }}>
              <div
                className="shanhai-section-title"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  color: '#ea580c',
                }}
              >
                <span>
                  <FireOutlined style={{ marginRight: 6 }} />
                  电影级漫剧出图 Prompt (Midjourney / Flux / Seedance 2.0)
                </span>
                <Button
                  size="small"
                  type="primary"
                  icon={<CopyOutlined />}
                  style={{ background: '#7c3aed', borderColor: '#7c3aed' }}
                  onClick={() => {
                    navigator.clipboard.writeText(character.visual_prompt || '');
                    message.success(
                      `已复制 ${character.name} 电影级生图词！可直接粘贴至 Midjourney / Flux 生图`,
                    );
                  }}
                >
                  一键复制提示词
                </Button>
              </div>
              <div className="shanhai-prompt-box">
                <Text code className="shanhai-prompt-code">
                  {character.visual_prompt}
                </Text>
              </div>
            </div>
          )}

          <Divider style={{ margin: '16px 0 12px 0' }} />

          <div className="shanhai-detail-tags">
            <span style={{ fontSize: 13, color: '#64748b', marginRight: 8 }}>考据标签:</span>
            {character.tags?.map((t) => (
              <Tag key={t} color="default" style={{ borderRadius: 4 }}>
                #{t}
              </Tag>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};
