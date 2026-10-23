import React, { useState } from 'react';
import {
  Card,
  Tag,
  Button,
  Space,
  Tooltip,
  Typography,
  Popconfirm,
  message,
} from 'antd';
import {
  EyeOutlined,
  CloudDownloadOutlined,
  CompassOutlined,
  VideoCameraOutlined,
  DeleteOutlined,
  PictureOutlined,
  CopyOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import type { ShanhaiCharacter } from '../types';
import { toSafeImageUrl } from '../api';

const { Text, Paragraph } = Typography;

interface CharacterCardProps {
  character: ShanhaiCharacter;
  onViewDetail: (char: ShanhaiCharacter) => void;
  onSearchImages: (char: ShanhaiCharacter) => void;
  onImportToStudio: (char: ShanhaiCharacter) => void;
  onDelete?: (charId: string) => void;
}

export const CharacterCard: React.FC<CharacterCardProps> = ({
  character,
  onViewDetail,
  onSearchImages,
  onImportToStudio,
  onDelete,
}) => {
  const images = character.images || [];
  // 选中的封面或当前浏览图片下标（0 ~ images.length-1）
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  const activeImage = images[activeImageIdx] || images[0];
  const safeImgUrl = activeImage ? toSafeImageUrl(activeImage.url) : '';

  // 根据分类返回专属典雅配色
  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case '瑞兽':
        return '#059669'; // 碧玉绿
      case '上古四凶':
        return '#dc2626'; // 赤朱红
      case '创世神祇':
        return '#d97706'; // 琥珀金
      case '远古战神':
        return '#b45309'; // 沉香褐
      case '神禽异鸟':
        return '#0284c7'; // 霁蓝
      case '镇山神兽':
        return '#7c3aed'; // 紫微金
      default:
        return '#4b5563';
    }
  };

  return (
    <Card
      hoverable
      className="shanhai-character-card"
      cover={
        <div className="shanhai-card-cover-wrapper">
          {safeImgUrl ? (
            <img
              alt={character.name}
              src={safeImgUrl}
              className="shanhai-card-cover-img"
              loading="lazy"
              onError={(e) => {
                // 如果直链报错，尝试通过原生 URL 直接回退
                const target = e.target as HTMLImageElement;
                if (activeImage && target.src !== activeImage.url) {
                  target.src = activeImage.url;
                }
              }}
            />
          ) : (
            <div className="shanhai-card-no-img">
              <PictureOutlined style={{ fontSize: 36, color: '#9ca3af' }} />
              <div style={{ marginTop: 8, fontSize: 13, color: '#6b7280' }}>暂无网络图卷</div>
            </div>
          )}

          {/* 顶部悬浮：山系归属徽标 */}
          <div className="shanhai-card-mountain-badge">
            <CompassOutlined style={{ marginRight: 4 }} />
            {character.mountain || '《山海经》大荒篇'}
          </div>

          {/* 底部悬浮：1~3 张图片多图切换与图题指示器 */}
          <div className="shanhai-card-gallery-bar">
            <span className="shanhai-gallery-caption" title={activeImage?.title || '山海画卷'}>
              {activeImage?.title ? activeImage.title.slice(0, 16) : `图卷 (${images.length}幅)`}
            </span>
            <div className="shanhai-gallery-indicators">
              {images.map((img, idx) => (
                <button
                  type="button"
                  key={img.id || idx}
                  className={`shanhai-indicator-dot ${idx === activeImageIdx ? 'active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImageIdx(idx);
                  }}
                  title={img.title || `第 ${idx + 1} 幅图卷`}
                />
              ))}
            </div>
          </div>
        </div>
      }
      actions={[
        <Tooltip key="detail" title="查看古籍原文与考据全貌">
          <Button
            type="text"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => onViewDetail(character)}
          >
            详考
          </Button>
        </Tooltip>,
        <Tooltip key="search-img" title="从网上检索 1~3 张新图片">
          <Button
            type="text"
            icon={<CloudDownloadOutlined />}
            size="small"
            style={{ color: '#0284c7' }}
            onClick={() => onSearchImages(character)}
          >
            搜网图
          </Button>
        </Tooltip>,
        <Tooltip key="studio" title="带入漫剧工作室进行角色制作">
          <Button
            type="text"
            icon={<VideoCameraOutlined />}
            size="small"
            style={{ color: '#d97706' }}
            onClick={() => onImportToStudio(character)}
          >
            立项
          </Button>
        </Tooltip>,
        character.visual_prompt ? (
          <Tooltip key="prompt" title="一键复制电影级AI分镜生图词 (Midjourney/Flux/Seedance)">
            <Button
              type="text"
              icon={<CopyOutlined />}
              size="small"
              style={{ color: '#8b5cf6' }}
              onClick={(e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(character.visual_prompt || '');
                message.success(`已复制 ${character.name} 电影级分镜出图提示词！可直接用于 Midjourney / Flux 生图`);
              }}
            >
              出图词
            </Button>
          </Tooltip>
        ) : null,
        onDelete && (
          <Popconfirm
            key="delete"
            title={`确定从专栏移除 ${character.name} 吗？`}
            okText="删除"
            cancelText="取消"
            onConfirm={() => onDelete(character.id)}
          >
            <Button type="text" danger icon={<DeleteOutlined />} size="small" />
          </Popconfirm>
        ),
      ].filter(Boolean)}
    >
      <div className="shanhai-card-header">
        <div className="shanhai-card-title-group">
          <h3 className="shanhai-card-name" onClick={() => onViewDetail(character)}>
            {character.name}
          </h3>
          {character.pinyin && <span className="shanhai-card-pinyin">{character.pinyin}</span>}
        </div>
        <Tag
          style={{
            borderColor: getCategoryColor(character.category),
            color: getCategoryColor(character.category),
            background: `${getCategoryColor(character.category)}12`,
            fontWeight: 500,
            borderRadius: 4,
          }}
        >
          {character.category}
        </Tag>
      </div>

      {character.title && (
        <div className="shanhai-card-honor-title">{character.title}</div>
      )}

      {/* 现代短剧双重身份（白天凡人 vs 夜晚古神） */}
      {(character.mortal_identity || character.divine_form) && (
        <div className="shanhai-card-dual-box">
          {character.mortal_identity && (
            <div className="shanhai-dual-row mortal">
              <span className="shanhai-dual-badge mortal">☀️ 白天</span>
              <span className="shanhai-dual-text" title={character.mortal_identity}>
                {character.mortal_identity.replace(/^【现代凡相】/, '')}
              </span>
            </div>
          )}
          {character.divine_form && (
            <div className="shanhai-dual-row divine">
              <span className="shanhai-dual-badge divine">🌙 夜晚</span>
              <span className="shanhai-dual-text" title={character.divine_form}>
                {character.divine_form.replace(/^【夜间真身】/, '')}
              </span>
            </div>
          )}
        </div>
      )}

      {/* 原文引录 */}
      {character.classic_quote && (
        <div className="shanhai-card-quote-box">
          <span className="shanhai-quote-mark-start">“</span>
          <Paragraph
            ellipsis={{ rows: 2, expandable: false }}
            className="shanhai-card-quote-text"
          >
            {character.classic_quote}
          </Paragraph>
          <span className="shanhai-quote-mark-end">”</span>
        </div>
      )}

      {/* 现代白话考略 */}
      <Paragraph
        ellipsis={{ rows: 2, expandable: false }}
        className="shanhai-card-desc-text"
      >
        {character.modern_desc || '暂无释义考据。'}
      </Paragraph>

      {/* 异能与标签 */}
      <div className="shanhai-card-tags">
        {character.ability && (
          <Tag color="gold" className="shanhai-tag-ability" title={`神职与异能: ${character.ability}`}>
            ✨ {character.ability.split('、')[0]}
          </Tag>
        )}
        {character.tags?.slice(0, 3).map((tag) => (
          <Tag key={tag} className="shanhai-tag-normal">
            {tag}
          </Tag>
        ))}
        {images.length > 0 && (
          <Tag className="shanhai-tag-image-count" icon={<PictureOutlined />}>
            {images.length} 张网图
          </Tag>
        )}
      </div>
    </Card>
  );
};
