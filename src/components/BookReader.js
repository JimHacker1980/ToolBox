import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';

// BookReader 组件：支持上传 JSON 文件，解析后展示书籍章节、段落、总结
const BookReader = () => {
  // 书籍数据
  const [bookData, setBookData] = useState(null);
  // 当前选中的章节索引
  const [chapterIdx, setChapterIdx] = useState(0);
  // 控制目录弹窗显示
  const [showBookMenu, setShowBookMenu] = useState(false);

  // 你设计的目录（可自定义）
  const books = [
    { name: '神经网络与深度学习', file: '/神经网络与深度学习 (邱锡鹏) (Z-Library).json', desc: '邱锡鹏' },
  ];

  // 处理文件上传
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);
        setBookData(json);
        setChapterIdx(0);
      } catch (err) {
        alert('文件内容不是有效的JSON格式');
      }
    };
    reader.readAsText(file);
  };

  // 选择public目录下的书，弹窗目录
  const handleSelectPublicBook = () => {
    setShowBookMenu(true);
  };

  // 用户点击目录项加载书
  const handleChooseBook = async (idx) => {
    setShowBookMenu(false);
    if (idx >= 0 && idx < books.length) {
      try {
        const res = await fetch((process.env.PUBLIC_URL || '') + books[idx].file);
        const json = await res.json();
        setBookData(json);
        setChapterIdx(0);
      } catch (err) {
        alert('加载失败，请检查 public 目录下是否有对应文件');
      }
    }
  };

  // 章节列表
  const chapters = Array.isArray(bookData) ? bookData : [];
  const currentChapter = chapters[chapterIdx] || {};
  const paragraphs = Array.isArray(currentChapter.内容) ? currentChapter.内容 : [];

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: 24 }}>
      {/* 上传区 */}
      {!bookData && (
        <div style={{ margin: '40px 0', textAlign: 'center' }}>
          <input
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
            id="book-upload"
          />
          <label htmlFor="book-upload" style={{
            display: 'inline-block',
            padding: '16px 36px',
            background: '#2563eb',
            color: '#fff',
            borderRadius: 10,
            fontSize: 18,
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 2px 8px #2563eb22',
            marginBottom: 18
          }}>
            上传书籍JSON文件
          </label>
          <button
            onClick={handleSelectPublicBook}
            style={{
              display: 'inline-block',
              marginLeft: 18,
              padding: '16px 36px',
              background: '#f3f6fa',
              color: '#2563eb',
              borderRadius: 10,
              fontSize: 18,
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 2px 8px #2563eb22',
              border: '1.5px solid #2563eb',
              marginBottom: 18
            }}
          >
            选择已有书籍
          </button>
          <div style={{ color: '#888', marginTop: 12 }}>请上传结构为章节-段落-总结的JSON文件，或选择已有书籍</div>
        </div>
      )}
      {/* 选择已有书籍按钮始终存在 */}
      {bookData && (
        <div style={{ marginBottom: 10, textAlign: 'right' }}>
          <button
            onClick={handleSelectPublicBook}
            style={{
              display: 'inline-block',
              padding: '7px 22px',
              background: '#f3f6fa',
              color: '#2563eb',
              borderRadius: 8,
              fontSize: 15,
              fontWeight: 600,
              cursor: 'pointer',
              border: '1px solid #2563eb',
              boxShadow: '0 1px 4px #2563eb11',
              transition: 'all 0.2s',
              marginRight: 8
            }}
          >
            选择已有书籍
          </button>
        </div>
      )}
      {/* 目录弹窗 */}
      {showBookMenu && (
        <div style={{
          position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh', zIndex: 1000,
          background: 'rgba(0,0,0,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 4px 32px #2563eb22', padding: 36, minWidth: 320, minHeight: 120 }}>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: '#2563eb', marginBottom: 18 }}>选择一本书</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {books.map((b, idx) => (
                <li key={b.file} style={{ marginBottom: 14 }}>
                  <button
                    onClick={() => handleChooseBook(idx)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '12px 18px',
                      borderRadius: 8,
                      border: '1.5px solid #2563eb',
                      background: '#f8fafc',
                      color: '#2563eb',
                      fontWeight: 600,
                      fontSize: 16,
                      cursor: 'pointer',
                      boxShadow: '0 1px 4px #2563eb11',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{ fontSize: 17, fontWeight: 700 }}>{b.name}</div>
                    <div style={{ fontSize: 14, color: '#888', marginTop: 2 }}>{b.desc}</div>
                  </button>
                </li>
              ))}
            </ul>
            <button
              onClick={() => setShowBookMenu(false)}
              style={{ marginTop: 18, color: '#888', background: 'none', border: 'none', fontSize: 15, cursor: 'pointer' }}
            >
              取消
            </button>
          </div>
        </div>
      )}
      {/* 章节导航与内容展示 */}
      {bookData && (
        <>
          {/* 重新加载按钮 */}
          <div style={{ marginBottom: 18, textAlign: 'right' }}>
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
              id="book-reload"
            />
            <label htmlFor="book-reload" style={{
              display: 'inline-block',
              padding: '7px 22px',
              background: '#f3f6fa',
              color: '#2563eb',
              borderRadius: 8,
              fontSize: 15,
              fontWeight: 600,
              cursor: 'pointer',
              border: '1px solid #2563eb',
              boxShadow: '0 1px 4px #2563eb11',
              transition: 'all 0.2s',
            }}>
              重新加载书籍JSON文件
            </label>
          </div>
          {/* 章节导航 - 横向可滚动 */}
          <div style={{
            display: 'flex',
            gap: 12,
            marginBottom: 24,
            overflowX: 'auto',
            paddingBottom: 6,
            scrollbarWidth: 'thin',
            scrollbarColor: '#2563eb22 #f3f6fa',
            WebkitOverflowScrolling: 'touch',
          }}>
            {chapters.map((ch, idx) => (
              <button
                key={idx}
                onClick={() => setChapterIdx(idx)}
                style={{
                  flex: '0 0 auto',
                  padding: '8px 18px',
                  borderRadius: 8,
                  border: idx === chapterIdx ? '2px solid #2563eb' : '1px solid #d1d5db',
                  background: idx === chapterIdx ? '#2563eb' : '#f3f6fa',
                  color: idx === chapterIdx ? '#fff' : '#222',
                  fontWeight: idx === chapterIdx ? 700 : 500,
                  cursor: 'pointer',
                  boxShadow: idx === chapterIdx ? '0 2px 8px #2563eb22' : 'none',
                  transition: 'all 0.2s',
                  minWidth: 90,
                  marginRight: 2,
                }}
              >
                {ch.标题 || `章节${idx + 1}`}
              </button>
            ))}
          </div>

          {/* 主内容区：正文markdown+总结对齐 */}
          <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px #2563eb11', padding: 28, minWidth: 0 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 18 }}>{currentChapter.标题}</h2>
            {paragraphs.map((para, idx) => (
              <div key={idx} style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 24,
                marginBottom: 36,
                borderBottom: '1px solid #e5e7eb',
                paddingBottom: 18,
                flexWrap: 'wrap',
              }}>
                {/* 正文区域 */}
                <div style={{
                  flex: 2,
                  minWidth: 0,
                  fontSize: 17,
                  lineHeight: 1.8,
                  marginBottom: 8,
                  wordBreak: 'break-word',
                }}>
                  <ReactMarkdown remarkPlugins={[remarkMath, remarkGfm]} rehypePlugins={[rehypeKatex]}>{para.段落 || ''}</ReactMarkdown>
                </div>
                {/* 总结区域 */}
                <div style={{
                  flex: 1,
                  minWidth: 180,
                  background: '#f8fafc',
                  borderRadius: 8,
                  padding: '12px 16px',
                  color: '#2563eb',
                  fontSize: 15,
                  marginTop: 0,
                  boxShadow: '0 1px 4px #2563eb11',
                  borderLeft: '4px solid #2563eb',
                  fontWeight: 500,
                  minHeight: 28,
                  marginLeft: 0,
                  wordBreak: 'break-word',
                }}>
                  <ReactMarkdown remarkPlugins={[remarkMath, remarkGfm]} rehypePlugins={[rehypeKatex]}>{para.总结 || ''}</ReactMarkdown>
                </div>
              </div>
            ))}
            {paragraphs.length === 0 && <div style={{ color: '#888', fontSize: 16 }}>暂无内容</div>}
          </div>
        </>
      )}
    </div>
  );
};

export default BookReader;
