import { useEffect, useState } from 'react';
import { Alert, Button, Image, InputNumber, Modal, Space, Spin } from 'antd';
import { LeftOutlined, RightOutlined, DownloadOutlined } from '@ant-design/icons';
import { shanhaijingApi } from '../api';
import type { ShanhaiEdition } from '../types';
import type { ReadingTarget } from './OriginalTextLibrary';
import './OriginalTextReader.css';

/** 逐页加载原色书影，让目录和引用跳转在手机及无PDF插件的浏览器中一致工作。 */
export function OriginalTextReader({
  target,
  onClose,
}: {
  target: ReadingTarget;
  onClose: () => void;
}) {
  const [edition, setEdition] = useState<ShanhaiEdition | null>(null);
  const [page, setPage] = useState(target.page);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [imageFailed, setImageFailed] = useState(false);
  const [imageAttempt, setImageAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setError('');
    shanhaijingApi
      .getEdition(target.editionId, controller.signal)
      .then((value) => {
        setEdition(value);
        setPage(Math.max(1, Math.min(value.page_count, target.page)));
      })
      .catch((err: unknown) => {
        if (!controller.signal.aborted)
          setError(err instanceof Error ? err.message : '原典加载失败');
      });
    return () => controller.abort();
  }, [target.editionId, target.page, attempt]);

  const goToPage = (value: number | null) => {
    if (value === null || !edition) return;
    setImageFailed(false);
    setPage(Math.max(1, Math.min(edition.page_count, Math.floor(value))));
  };
  const activeChapter = edition?.chapters
    .filter((chapter) => chapter.start_pdf_page <= page)
    .at(-1);

  return (
    <Modal
      open
      onCancel={onClose}
      className="shanhai-reader-modal"
      width="min(1400px, 96vw)"
      zIndex={1200}
      footer={null}
      title={edition?.title ?? '宋刻本阅读器'}
    >
      {error ? (
        <Alert
          type="error"
          message={error}
          showIcon
          action={<Button onClick={() => setAttempt((v) => v + 1)}>重试</Button>}
        />
      ) : !edition ? (
        <Spin tip="正在载入版本">
          <div style={{ minHeight: 200 }} />
        </Spin>
      ) : (
        <>
          <div className="shanhai-reader-toolbar">
            <Space wrap>
              <Button
                aria-label="上一页"
                icon={<LeftOutlined />}
                disabled={page <= 1}
                onClick={() => goToPage(page - 1)}
              >
                上一页
              </Button>
              <label>
                扫描页{' '}
                <InputNumber
                  aria-label="扫描页码"
                  min={1}
                  max={edition.page_count}
                  precision={0}
                  value={page}
                  onChange={goToPage}
                />{' '}
                / {edition.page_count}
              </label>
              <Button
                aria-label="下一页"
                icon={<RightOutlined />}
                disabled={page >= edition.page_count}
                onClick={() => goToPage(page + 1)}
              >
                下一页
              </Button>
            </Space>
            <Button
              icon={<DownloadOutlined />}
              disabled={!edition.pdf_available}
              href={edition.pdf_available ? `${edition.pdf_url}#page=${page}` : undefined}
              target="_blank"
              rel="noopener noreferrer"
            >
              打开原版PDF
            </Button>
          </div>
          <p className="shanhai-source-note">
            {activeChapter?.title ?? '封面与序文'} · 第{page}
            扫描页。页码以PDF为准，一张书影可能含两个半叶；点击书影可放大查看。
          </p>
          <div className="shanhai-reader-layout">
            <nav className="shanhai-reader-chapters" aria-label="阅读器经卷目录">
              <button
                onClick={() => goToPage(1)}
                aria-current={page < edition.chapters[0].start_pdf_page ? 'page' : undefined}
              >
                封面与序文 <small>1</small>
              </button>
              {edition.chapters.map((chapter) => (
                <button
                  key={chapter.number}
                  aria-current={activeChapter?.number === chapter.number ? 'page' : undefined}
                  onClick={() => goToPage(chapter.start_pdf_page)}
                >
                  {chapter.number}. {chapter.title}
                  <small>{chapter.start_pdf_page}</small>
                </button>
              ))}
            </nav>
            <div className="shanhai-reader-page" key={page}>
              {!edition.preview_available ? (
                <Alert
                  type="warning"
                  showIcon
                  message="书影尚未导入"
                  description={
                    edition.pdf_available
                      ? '可使用上方“打开原版PDF”阅读这一页。'
                      : '本机尚未准备阅读资源，请完成宋本资料导入。'
                  }
                />
              ) : imageFailed ? (
                <Alert
                  type="error"
                  showIcon
                  message={`第${page}页书影加载失败`}
                  description="可重试，或使用原版PDF查看。"
                  action={
                    <Button
                      onClick={() => {
                        setImageFailed(false);
                        setImageAttempt((v) => v + 1);
                      }}
                    >
                      重试书页
                    </Button>
                  }
                />
              ) : (
                <Image
                  key={`${page}-${imageAttempt}`}
                  src={`${edition.page_image_base_url}/${String(page).padStart(3, '0')}.webp`}
                  alt={`1180年宋刻本 第${page}页`}
                  width="100%"
                  onError={() => setImageFailed(true)}
                  placeholder={
                    <div className="shanhai-reader-placeholder">
                      <Spin />
                    </div>
                  }
                  preview={{ mask: false, zIndex: 1300 }}
                />
              )}
            </div>
          </div>
          <p className="shanhai-source-note">
            {edition.notes}{' '}
            <a href={edition.source_url} target="_blank" rel="noopener noreferrer">
              查看版本来源
            </a>
          </p>
        </>
      )}
    </Modal>
  );
}
