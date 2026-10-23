import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  Checkbox,
  Button,
  Space,
  Divider,
  message,
} from 'antd';
import {
  PlusOutlined,
  CloudDownloadOutlined,
  BookOutlined,
} from '@ant-design/icons';
import type { ShanhaiCharacter } from '../types';
import { shanhaijingApi } from '../api';

const { TextArea } = Input;

interface CharacterFormModalProps {
  open: boolean;
  character: ShanhaiCharacter | null;
  onClose: () => void;
  onSuccess: (char: ShanhaiCharacter) => void;
}

export const CharacterFormModal: React.FC<CharacterFormModalProps> = ({
  open,
  character,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [fetchingImages, setFetchingImages] = useState(false);

  useEffect(() => {
    if (open) {
      if (character) {
        form.setFieldsValue({
          name: character.name,
          pinyin: character.pinyin,
          title: character.title,
          category: character.category,
          mountain: character.mountain,
          classic_quote: character.classic_quote,
          modern_desc: character.modern_desc,
          ability: character.ability,
          mortal_identity: character.mortal_identity,
          divine_form: character.divine_form,
          visual_prompt: character.visual_prompt,
          tags: character.tags?.join(', '),
          auto_fetch_images: false,
        });
      } else {
        form.resetFields();
        form.setFieldsValue({
          category: '异兽',
          mountain: '《南山经》· 佡丘之山',
          auto_fetch_images: true,
        });
      }
    }
  }, [character, open, form]);

  const handleQuickFetch = async () => {
    const name = form.getFieldValue('name');
    if (!name) {
      message.warning('请先输入神兽/角色名称');
      return;
    }
    setFetchingImages(true);
    try {
      const res = await shanhaijingApi.searchWebImages(name, 3);
      if (res.images && res.images.length > 0) {
        message.success(`成功从网上检索到 ${res.images.length} 张图片！创建后将自动保存入库。`);
      } else {
        message.info(`未检索到与「${name}」相关的公开图片`);
      }
    } catch (e: any) {
      message.error(e?.message || '检索失败');
    } finally {
      setFetchingImages(false);
    }
  };

  const handleFinish = async (values: any) => {
    setSubmitting(true);
    try {
      const tagsArray = values.tags
        ? values.tags.split(/[,，\s]+/).map((t: string) => t.trim()).filter(Boolean)
        : [values.name, values.category];

      const payload = {
        name: values.name.trim(),
        pinyin: values.pinyin?.trim() || '',
        title: values.title?.trim() || `山海异兽 · ${values.name}`,
        category: values.category || '异兽',
        mountain: values.mountain?.trim() || '《山海经》大荒篇',
        classic_quote: values.classic_quote?.trim() || '',
        modern_desc: values.modern_desc?.trim() || '',
        ability: values.ability?.trim() || '',
        mortal_identity: values.mortal_identity?.trim() || '',
        divine_form: values.divine_form?.trim() || '',
        visual_prompt: values.visual_prompt?.trim() || '',
        tags: tagsArray,
        auto_fetch_images: Boolean(values.auto_fetch_images),
      };

      let result: ShanhaiCharacter;
      if (character) {
        result = await shanhaijingApi.updateCharacter(character.id, payload);
        message.success(`成功更新角色【${result.name}】！`);
      } else {
        result = await shanhaijingApi.createCharacter(payload);
        message.success(`成功创建并录入【${result.name}】至山海经专栏！已自动配备 ${result.images?.length || 0} 张网络图卷。`);
      }

      onSuccess(result);
      onClose();
    } catch (err: any) {
      message.error(err?.message || '保存角色失败');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      width={680}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <BookOutlined style={{ color: '#d97706', fontSize: 20 }} />
          <span>{character ? `编辑山海经角色 · ${character.name}` : '录入新角色至山海经专栏'}</span>
        </div>
      }
      footer={[
        <Button key="cancel" onClick={onClose}>
          取消
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={submitting}
          onClick={() => form.submit()}
          style={{ background: '#059669', borderColor: '#059669' }}
        >
          {character ? '保存修改' : '确认录入并建档'}
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Form.Item
            name="name"
            label="角色名称"
            rules={[{ required: true, message: '请输入神兽/角色名称' }]}
          >
            <Input placeholder="例如：九尾狐、烛龙、饕餮" />
          </Form.Item>

          <Form.Item name="pinyin" label="汉语拼音">
            <Input placeholder="例如：jiǔ wěi hú" />
          </Form.Item>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Form.Item name="category" label="专栏分类" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="瑞兽">瑞兽</Select.Option>
              <Select.Option value="上古四凶">上古四凶</Select.Option>
              <Select.Option value="创世神祇">创世神祇</Select.Option>
              <Select.Option value="远古战神">远古战神</Select.Option>
              <Select.Option value="神禽异鸟">神禽异鸟</Select.Option>
              <Select.Option value="镇山神兽">镇山神兽</Select.Option>
              <Select.Option value="异兽">异兽</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="mountain" label="山系与经卷归属">
            <Input placeholder="例如：《南山经》· 青丘之山" />
          </Form.Item>
        </div>

        <Form.Item name="title" label="尊号 / 别称">
          <Input placeholder="例如：青丘祥瑞 · 魅影仙狐" />
        </Form.Item>

        <Form.Item name="classic_quote" label="《山海经》古籍文言原文">
          <TextArea
            rows={3}
            placeholder="例如：又东三百里，曰青丘之山...有兽焉，其状如狐而九尾，其音如婴儿..."
          />
        </Form.Item>

        <Form.Item name="modern_desc" label="白话文考释与外貌特征">
          <TextArea
            rows={2}
            placeholder="描述其外表形状、羽翼鳞甲、啼鸣之声与后世演变..."
          />
        </Form.Item>

        <Form.Item name="ability" label="神职、异能与祥凶寓意">
          <Input placeholder="例如：辟邪防蛊、灵慧幻化、通晓人言" />
        </Form.Item>

        <Form.Item name="mortal_identity" label="☀️ 白天凡相（现代短剧身份设定）">
          <Input placeholder="例如：【现代凡相】急诊科夜班医生（林夜），见惯生死，疲惫执着..." />
        </Form.Item>

        <Form.Item name="divine_form" label="🌙 夜晚真身（山海古神洪荒法相）">
          <Input placeholder="例如：【夜间真身】千丈赤红烛龙法相，盘绕钟山绝壁，开目为昼闭目为夜..." />
        </Form.Item>

        <Form.Item name="visual_prompt" label="🎬 电影级 AI 分镜出图 Prompt (Midjourney / Flux / Seedance)">
          <TextArea
            rows={2}
            placeholder="例如：Masterpiece, cinematic concept art, Shan Hai Jing Torch Dragon, colossal scale, Tyndall lighting, 8k..."
          />
        </Form.Item>

        <Form.Item name="tags" label="考据标签（逗号分隔）">
          <Input placeholder="青丘, 祥瑞, 九尾, 防蛊辟邪" />
        </Form.Item>

        {!character && (
          <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, marginTop: 8 }}>
            <Form.Item
              name="auto_fetch_images"
              valuePropName="checked"
              style={{ margin: 0 }}
            >
              <Checkbox>
                <strong>从网上自动检索 1~3 张图片</strong>
                <span style={{ color: '#64748b', fontSize: 12, marginLeft: 8 }}>
                  （自动通过维基媒体与百科全网检索该神兽的历史文物与古籍插画）
                </span>
              </Checkbox>
            </Form.Item>
          </div>
        )}
      </Form>
    </Modal>
  );
};
