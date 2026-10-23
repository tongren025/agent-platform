import { useEffect, useState } from 'react';
import { Alert, Button, Spin, Tag } from 'antd';
import { BookOutlined, DownloadOutlined } from '@ant-design/icons';
import { shanhaijingApi } from '../api';
import type { ShanhaiEdition } from '../types';
import './OriginalTextReader.css';

export interface ReadingTarget {
  editionId: string;
  page: number;
}

/** 原典入口独立加载，版本资源暂不可用时仍保留角色图鉴。 */
export function OriginalTextLibrary({ onRead }: { onRead: (target: ReadingTarget) => void }) {
  const [editions, setEditions] = useState<ShanhaiEdition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    shanhaijingApi
      .listEditions(controller.signal)
      .then(setEditions)
      .catch((err: unknown) => {
        if (!controller.signal.aborted)
          setError(err instanceof Error ? err.message : '原典加载失败');
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [attempt]);

  return (
    <section className="shanhai-original-library" aria-label="原典版本">
      <div className="shanhai-original-heading">
        <BookOutlined />
        <h2>原典版本 · 回到古书本身</h2>
      </div>
      {loading ? (
        <Spin tip="正在载入原典目录">
          <div style={{ minHeight: 64 }} />
        </Spin>
      ) : error ? (
        <Alert
          type="warning"
          showIcon
          message={error}
          action={<Button onClick={() => setAttempt((v) => v + 1)}>重试</Button>}
        />
      ) : editions.length === 0 ? (
        <p>暂无已登记的原典版本。</p>
      ) : (
        editions.map((edition) => (
          <div key={edition.id}>
            <div className="shanhai-original-summary">
              <div>
                <Tag color="gold">{edition.year}年 · 南宋</Tag>
                <strong>{edition.title}</strong>
                <p>
                  {edition.annotator}注 · {edition.editor}校 · {edition.holding_institution}藏 ·{' '}
                  {edition.chapters.length}卷 / {edition.page_count}扫描页
                </p>
              </div>
              <div className="shanhai-original-actions">
                <Button
                  type="primary"
                  icon={<BookOutlined />}
                  onClick={() =>
                    onRead({
                      editionId: edition.id,
                      page: edition.chapters[0]?.start_pdf_page ?? 1,
                    })
                  }
                >
                  阅读宋刻本
                </Button>
                <Button
                  icon={<DownloadOutlined />}
                  disabled={!edition.pdf_available}
                  href={edition.pdf_available ? edition.pdf_url : undefined}
                  download
                >
                  原版PDF · {(edition.file_bytes / 1048576).toFixed(0)} MiB
                </Button>
              </div>
            </div>
            {!edition.preview_available && (
              <Alert
                type="warning"
                showIcon
                message="逐页书影尚未就绪，可先打开目录或阅读原版PDF。"
              />
            )}
            <p className="shanhai-source-note">{edition.notes}</p>
            <nav className="shanhai-chapter-grid" aria-label="十八卷目录">
              {edition.chapters.map((chapter) => (
                <button
                  key={chapter.number}
                  onClick={() => onRead({ editionId: edition.id, page: chapter.start_pdf_page })}
                >
                  <span>
                    {String(chapter.number).padStart(2, '0')} · {chapter.title}
                  </span>
                  <small>第{chapter.start_pdf_page}页</small>
                </button>
              ))}
            </nav>
          </div>
        ))
      )}
    </section>
  );
}
