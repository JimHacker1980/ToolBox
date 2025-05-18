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
    <div className="flex">
      {/* 侧边栏 */}
      <div className="w-1/4 border-r border-gray-300 p-4" style={{ maxHeight: '400px', overflowY: 'auto' }}>
        <div className="flex justify-between mb-4">
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
  );
};

export default JsonViewer;