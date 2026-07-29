// Fabric.js 视觉排版画布：适合图片、字幕、形状和分镜卡片的精细布局。
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button, ColorPicker, Input, Space, Tooltip } from 'antd';
import {
  DeleteOutlined, DownloadOutlined, FontSizeOutlined, PictureOutlined,
  PlusSquareOutlined, SaveOutlined,
} from '@ant-design/icons';
import { Canvas, FabricImage, IText, Rect } from 'fabric';
import { message } from '../../ui';
import { useCanvasEngineDocument } from '../../hooks/useCanvasEngineDocument';
import { EngineError, EngineLoading, SavingBadge } from './EngineState';

const STAGE_WIDTH = 1280;
const STAGE_HEIGHT = 720;

export default function FabricCanvas() {
  const canvasElementRef = useRef<HTMLCanvasElement>(null);
  const canvasRef = useRef<Canvas | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const restoringRef = useRef(true);
  const [caption, setCaption] = useState('输入字幕');
  const [color, setColor] = useState('#6366f1');
  const { initialContent, loading, saving, error, scheduleSave, save, retry } = useCanvasEngineDocument('fabric');

  const serialize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return {};
    return {
      version: 1,
      width: STAGE_WIDTH,
      height: STAGE_HEIGHT,
      canvas: canvas.toJSON(),
    };
  }, []);

  useEffect(() => {
    if (loading || !initialContent || !canvasElementRef.current) return;
    const canvas = new Canvas(canvasElementRef.current, {
      width: STAGE_WIDTH,
      height: STAGE_HEIGHT,
      backgroundColor: '#ffffff',
      preserveObjectStacking: true,
      selection: true,
    });
    canvasRef.current = canvas;

    const persist = () => {
      if (!restoringRef.current) scheduleSave(serialize());
    };
    canvas.on('object:added', persist);
    canvas.on('object:modified', persist);
    canvas.on('object:removed', persist);

    const restore = async () => {
      if (initialContent.canvas) {
        await canvas.loadFromJSON(initialContent.canvas);
      } else {
        const title = new IText('视觉排版画布', {
          left: 72, top: 60, fontSize: 48, fontWeight: 'bold', fill: '#0f172a',
        });
        const hint = new IText('添加图片、字幕和形状，制作封面或分镜构图', {
          left: 76, top: 130, fontSize: 22, fill: '#64748b',
        });
        canvas.add(title, hint);
      }
      canvas.requestRenderAll();
      restoringRef.current = false;
    };
    void restore();

    return () => {
      canvas.dispose();
      canvasRef.current = null;
    };
  }, [initialContent, loading, scheduleSave, serialize]);

  const addText = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const text = new IText(caption.trim() || '输入字幕', {
      left: 120, top: 160, fontSize: 42, fill: color, fontFamily: 'sans-serif',
    });
    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.requestRenderAll();
  };

  const addRect = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = new Rect({
      left: 160, top: 220, width: 320, height: 180,
      fill: color, opacity: 0.85, rx: 18, ry: 18,
    });
    canvas.add(rect);
    canvas.setActiveObject(rect);
    canvas.requestRenderAll();
  };

  const removeSelected = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const selected = canvas.getActiveObjects();
    if (!selected.length) {
      message.info('请先选择一个或多个元素');
      return;
    }
    canvas.discardActiveObject();
    selected.forEach((object) => canvas.remove(object));
    canvas.requestRenderAll();
  };

  const importImage = (file?: File) => {
    const canvas = canvasRef.current;
    if (!canvas || !file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const image = await FabricImage.fromURL(String(reader.result));
      image.scaleToWidth(Math.min(640, image.width || 640));
      image.set({ left: 100, top: 100 });
      canvas.add(image);
      canvas.setActiveObject(image);
      canvas.requestRenderAll();
    };
    reader.readAsDataURL(file);
  };

  const exportPng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.discardActiveObject();
    canvas.requestRenderAll();
    const link = document.createElement('a');
    link.download = `fabric-canvas-${Date.now()}.png`;
    link.href = canvas.toDataURL({ format: 'png', multiplier: 2 });
    link.click();
  };

  if (loading || !initialContent) return <EngineLoading label="视觉排版画布" />;

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative', background: '#e2e8f0' }}>
      <EngineError message={error} onRetry={retry} />
      <SavingBadge saving={saving} />
      <div style={{
        minHeight: 48, display: 'flex', alignItems: 'center', gap: 8,
        padding: '6px 150px 6px 12px', background: '#fff', borderBottom: '1px solid #e2e8f0',
        overflowX: 'auto',
      }}>
        <Input value={caption} onChange={(event) => setCaption(event.target.value)} style={{ width: 210 }} />
        <ColorPicker value={color} onChange={(_, hex) => setColor(hex)} />
        <Button icon={<FontSizeOutlined />} onClick={addText}>添加文字</Button>
        <Button icon={<PlusSquareOutlined />} onClick={addRect}>添加形状</Button>
        <Button icon={<PictureOutlined />} onClick={() => fileRef.current?.click()}>导入图片</Button>
        <Tooltip title="删除当前选择">
          <Button danger icon={<DeleteOutlined />} onClick={removeSelected} />
        </Tooltip>
        <Button icon={<SaveOutlined />} onClick={() => void save(serialize())}>立即保存</Button>
        <Button type="primary" icon={<DownloadOutlined />} onClick={exportPng}>导出 PNG</Button>
        <input
          ref={fileRef}
          hidden
          type="file"
          accept="image/*"
          onChange={(event) => {
            importImage(event.target.files?.[0]);
            event.currentTarget.value = '';
          }}
        />
      </div>
      <div style={{ flex: 1, overflow: 'auto', padding: 28 }}>
        <div style={{
          width: STAGE_WIDTH, height: STAGE_HEIGHT, margin: '0 auto',
          boxShadow: '0 12px 40px rgba(15,23,42,.18)', background: '#fff',
        }}>
          <canvas ref={canvasElementRef} aria-label="Fabric 视觉排版画布" />
        </div>
      </div>
    </div>
  );
}
