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
    <div>
    <div styles={{padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'}}>
          <button
            style={{
              display: 'inline-block',
              width: '15%',
              padding: '8px 10px',
              fontSize: '14px',
              fontWeight: 'bold',
              textAlign: 'center',
              color: '#ffffff',
              backgroundColor: '#87CEEB', // 淡蓝色
              border: 'none',
              borderRadius: '6px',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              cursor: 'pointer',
              transition: 'background-color 0.3s, transform 0.2s',
              marginRight: '0.5%',
            }}
            onClick={() => handleTypeChange('概念')}
          >
            概念
          </button>
          <button
            style={{
              display: 'inline-block',
              width: '15%',
              padding: '8px 10px',
              fontSize: '14px',
              fontWeight: 'bold',
              textAlign: 'center',
              color: '#ffffff',
              backgroundColor: '#87CEEB', // 淡蓝色
              border: 'none',
              borderRadius: '6px',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              cursor: 'pointer',
              transition: 'background-color 0.3s, transform 0.2s',
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
          width: 300,
          minWidth: 300,
          maxWidth: 300,
          borderRight: '1.5px solid #b6c2d1',
          padding: 28,
          maxHeight: 500,
          overflowY: 'auto',
          boxSizing: 'border-box',
          background: 'transparent',
          borderTopLeftRadius: 18,
          borderBottomLeftRadius: 18,
          boxShadow: '2px 0 12px 0 rgba(59,130,246,0.07)',
          borderRightWidth: 2,
          borderRightStyle: 'solid',
          borderRightColor: '#b6c2d1',
          marginTop: 24,
          marginBottom: 24,
          marginLeft: 24,
          marginRight: 24,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          // 自定义滚动条
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(59,130,246,0.15) transparent',
        }}
      >
        <style>{`
          /* 仅作用于本侧边栏的滚动条 */
          div[style*='overflow-y: auto']::-webkit-scrollbar {
            width: 10px;
            background: transparent;
          }
          div[style*='overflow-y: auto']::-webkit-scrollbar-thumb {
            background: rgba(59,130,246,0.15);
            border-radius: 8px;
          }
        `}</style>
        <ul>
          {jsonData[selectedType]?.map((item, index) => (
            <li
              key={index}
              className="cursor-pointer py-2 px-4 mb-2"
              style={
                selectedItem === item
                  ? {
                      backgroundColor: '#87CEEB', // 深蓝色
                      color: '#fff',
                      borderRadius: '6px',
                      fontWeight: 'bold',
                      boxShadow: '0 2px 8px #87CEEB',
                    }
                  : {
                      borderRadius: '6px',
                      fontWeight: 'bold',
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
      <div className="w-3/4 p-4">
        {selectedItem ? (
          <div>
            <h2 className="text-2xl font-bold mb-4">
              {selectedType === '概念' ? selectedItem.概念名 : selectedItem.定理内容.split('**')[1]}
            </h2>
            <div className="prose">
              {selectedType === '概念' ? (
                <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{selectedItem.概念定义}</ReactMarkdown>
              ) : (
                <div>
                  <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{selectedItem.定理内容}</ReactMarkdown>
                  <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{selectedItem.证明}</ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        ) : (
          <p className="text-gray-500">请选择一个{selectedType}以查看详细信息。</p>
        )}
      </div>
    </div>
    </div>
  );
};

export default JsonViewer;