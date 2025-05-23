import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

const JsonViewer = ({ content, onItemSelect }) => {
  const jsonData = content;
  const [selectedType, setSelectedType] = useState('概念');
  const [selectedItem, setSelectedItem] = useState(null);

  const handleTypeChange = (type) => {
    setSelectedType(type);
    setSelectedItem(null);
  };

  const handleItemClick = (item) => {
    setSelectedItem(item);
    if (onItemSelect) {
      onItemSelect(item, selectedType);
    }
  };

  return (
    <div style={{ background: '#f6faff', borderRadius: 18, boxShadow: '0 4px 32px 0 rgba(59,130,246,0.08)', padding: 32, margin: '0 auto', maxWidth: 1200 }}>
      {/* 类型切换按钮 */}
      <div style={{
        display: 'flex',
        gap: 18,
        marginBottom: 24,
        background: '#f8fafc',
        borderRadius: 10,
        boxShadow: '0 2px 8px #2563eb11',
        padding: '12px 24px',
        alignItems: 'center',
        width: 'fit-content',
      }}>
        <button
          style={{
            padding: '8px 28px',
            fontSize: 16,
            fontWeight: 600,
            color: selectedType === '概念' ? '#fff' : '#2563eb',
            background: selectedType === '概念' ? 'linear-gradient(90deg,#60a5fa 0%,#2563eb 100%)' : '#f3f6fa',
            border: selectedType === '概念' ? '2px solid #2563eb' : '1.5px solid #dbeafe',
            borderRadius: 8,
            boxShadow: selectedType === '概念' ? '0 2px 8px #2563eb22' : 'none',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onClick={() => handleTypeChange('概念')}
        >
          概念
        </button>
        <button
          style={{
            padding: '8px 28px',
            fontSize: 16,
            fontWeight: 600,
            color: selectedType === '定理' ? '#fff' : '#2563eb',
            background: selectedType === '定理' ? 'linear-gradient(90deg,#60a5fa 0%,#2563eb 100%)' : '#f3f6fa',
            border: selectedType === '定理' ? '2px solid #2563eb' : '1.5px solid #dbeafe',
            borderRadius: 8,
            boxShadow: selectedType === '定理' ? '0 2px 8px #2563eb22' : 'none',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onClick={() => handleTypeChange('定理')}
        >
          定理
        </button>
      </div>
      <div style={{ display: 'flex', width: '100%' }}>
        {/* 侧边栏 */}
        <div
          style={{
            width: 200,
            minWidth: 140,
            maxWidth: 220,
            borderRight: '1.5px solid #b6c2d1',
            padding: '2px 0',
            maxHeight: 540,
            overflowY: 'auto',
            background: '#f8fafc',
            borderTopLeftRadius: 16,
            borderBottomLeftRadius: 16,
            boxShadow: '2px 0 12px 0 rgba(59,130,246,0.07)',
            marginTop: 12,
            marginBottom: 12,
            marginLeft: 0,
            marginRight: 32,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(59,130,246,0.15) transparent',
          }}
        >
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {jsonData[selectedType]?.map((item, index) => (
              <li
                key={index}
                style={
                  selectedItem === item
                    ? {
                        background: 'linear-gradient(90deg,#60a5fa 0%,#2563eb 100%)',
                        color: '#fff',
                        borderRadius: 6,
                        fontWeight: 700,
                        boxShadow: '0 2px 8px #2563eb22',
                        padding: '2px 8px',
                        marginBottom: 2,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        fontSize: 15,
                        lineHeight: 1.1,
                        minHeight: 22,
                        display: 'flex',
                        alignItems: 'center',
                      }
                    : {
                        borderRadius: 6,
                        fontWeight: 600,
                        padding: '2px 8px',
                        marginBottom: 2,
                        color: '#2563eb',
                        background: '#fff',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        fontSize: 15,
                        lineHeight: 1.1,
                        minHeight: 22,
                        display: 'flex',
                        alignItems: 'center',
                      }
                }
                onClick={() => handleItemClick(item)}
              >
                {selectedType === '概念' ? item.概念名 : item.定理内容.split('**')[1]}
              </li>
            ))}
          </ul>
        </div>
        {/* 主内容区 */}
        <div style={{ flex: 1, background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px #2563eb11', padding: 36, minHeight: 320, marginTop: 12, marginBottom: 12 }}>
          {selectedItem ? (
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 700, color: '#2563eb', marginBottom: 18 }}>
                {selectedType === '概念' ? selectedItem.概念名 : selectedItem.定理内容.split('**')[1]}
              </h2>
              <div style={{ fontSize: 17, color: '#222', lineHeight: 1.8 }}>
                {selectedType === '概念' ? (
                  <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{selectedItem.概念定义}</ReactMarkdown>
                ) : (
                  <div>
                    <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{selectedItem.定理内容}</ReactMarkdown>
                    <div style={{ marginTop: 18, background: '#f8fafc', borderRadius: 8, padding: '12px 16px', fontSize: 16 }}>
                      <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{selectedItem.证明}</ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p style={{ color: '#888', fontSize: 16 }}>请选择一个{selectedType}以查看详细信息。</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default JsonViewer;