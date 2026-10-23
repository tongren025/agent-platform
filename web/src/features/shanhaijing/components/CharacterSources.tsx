import { useEffect, useState } from 'react';
import { Alert, Button, Spin, Tag } from 'antd';
import { BookOutlined, LinkOutlined } from '@ant-design/icons';
import { shanhaijingApi } from '../api';
import type { ShanhaiCitation } from '../types';
import type { ReadingTarget } from './OriginalTextLibrary';
import './OriginalTextReader.css';

const STATUS = {
  located: ['已核对摘录与页码', 'green'],
  pending: ['出处待校勘', 'orange'],
  external: ['其他典籍', 'blue'],
} as const;

/** 展示独立考据记录，认证范围限定为摘录，不把旧档案拼接句认证为宋本原文。 */
export function CharacterSources({
  characterId,
  onRead,
}: {
  characterId: string;
  onRead: (target: ReadingTarget) => void;
}) {
  const [citations, setCitations] = useState<ShanhaiCitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    shanhaijingApi
      .getCitations(characterId, controller.signal)
      .then(setCitations)
      .catch((err: unknown) => {
        if (!controller.signal.aborted)
          setError(err instanceof Error ? err.message : '出处加载失败');
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [characterId, attempt]);

  return (
    <section className="shanhai-citations" aria-label="原文出处与校勘">
      <h3>
        <BookOutlined /> 原文出处与校勘
      </h3>
      {loading ? (
        <Spin />
      ) : error ? (
        <Alert
          type="warning"
          message={error}
          action={<Button onClick={() => setAttempt((v) => v + 1)}>重试</Button>}
        />
      ) : citations.length === 0 ? (
        <p>尚未建立原典引用。下方档案引文需要核对版本与页码。</p>
      ) : (
        citations.map((citation) => (
          <article key={citation.id} className="shanhai-citation-card">
            <Tag color={STATUS[citation.review_status][1]}>{STATUS[citation.review_status][0]}</Tag>
            <strong>{citation.source_title}</strong>
            {citation.edition_title && (
              <p className="shanhai-source-note">
                {citation.edition_title}
                {citation.chapter_title ? ` · ${citation.chapter_title}` : ''}
              </p>
            )}
            {citation.excerpt && <blockquote>{citation.excerpt}</blockquote>}
            {citation.pdf_page && (
              <p className="shanhai-source-note">
                PDF第{citation.pdf_page}页
                {citation.scan_side === 'left'
                  ? ' · 左半页'
                  : citation.scan_side === 'right'
                    ? ' · 右半页'
                    : ''}{' '}
                · 摘录转简体，标点后加。
              </p>
            )}
            <p className="shanhai-source-note">{citation.note}</p>
            {citation.source_url && (
              <Button
                size="small"
                icon={<LinkOutlined />}
                href={citation.source_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                查看典籍原文
              </Button>
            )}
            {citation.edition_id && (citation.pdf_page || citation.chapter_start_pdf_page) && (
              <Button
                size="small"
                icon={<BookOutlined />}
                onClick={() =>
                  onRead({
                    editionId: citation.edition_id!,
                    page: citation.pdf_page ?? citation.chapter_start_pdf_page!,
                  })
                }
              >
                {citation.review_status === 'located'
                  ? `查看原文第${citation.pdf_page}页`
                  : '查阅候选经卷'}
              </Button>
            )}
          </article>
        ))
      )}
    </section>
  );
}
