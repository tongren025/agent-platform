import React, { useState } from 'react';
import {
  Modal,
  Tag,
  Button,
  Space,
  Descriptions,
  Divider,
  Image,
  Typography,
  message,
} from 'antd';
import {
  CompassOutlined,
  CloudDownloadOutlined,
  VideoCameraOutlined,
  PictureOutlined,
  BookOutlined,
  ThunderboltOutlined,
  LinkOutlined,
} from '@ant-design/icons';
import type { ShanhaiCharacter } from '../types';
import { toSafeImageUrl } from '../api';

const { Title, Paragraph, Text } = Typography;

interface CharacterDetailModalProps {
  character: ShanhaiCharacter | null;
  open: boolean;
  onClose: () => void;
  onSearchImages: (char: ShanhaiCharacter) => void;
  onImportToStudio: (char: ShanhaiCharacter) => void;
}

export const CharacterDetailModal: React.FC<CharacterDetailModalProps> = ({
  character,
  open,
  onClose,
  onSearchImages,
  onImportToStudio,
}) => {
  if (!character) return null;

  const images = character.images || [];
  const [selectedImgIdx, setSelectedImgIdx] = useState(0);

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
          {character.title && <span className="shanhai-modal-title-suffix">· {character.title}</span>}
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
          <div className="shanhai-detail-section">
            <div className="shanhai-section-title">
              <BookOutlined style={{ marginRight: 6, color: '#b45309' }} />
              山海经古籍原文
            </div>
            <div className="shanhai-quote-full-box">
              <div className="shanhai-mountain-origin">
                <CompassOutlined style={{ marginRight: 4 }} />
                典籍出处：{character.mountain || '《山海经》大荒篇'}
              </div>
              <Paragraph className="shanhai-ancient-text">
                {character.classic_quote || '未载原文引句。'}
              </Paragraph>
            </div>
          </div>

          <div className="shanhai-detail-section" style={{ marginTop: 16 }}>
            <div className="shanhai-section-title">
              <PictureOutlined style={{ marginRight: 6, color: '#059669' }} />
              外貌特征与白话考释
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
              <div className="shanhai-ability-box">
                {character.ability}
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
