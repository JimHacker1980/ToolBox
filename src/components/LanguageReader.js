import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

const LanguageReader = () => {
  const [apiKey, setApiKey] = useState('');
  const [textBlocks, setTextBlocks] = useState([{
    id: 0,
    text: '',
    parsed: null,
    translated: null,
    analysis: null,
    wordDetails: {} // 存储单词详细解析
  }]);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);
  const textareaRefs = useRef({});
  // 新增：用于弹窗显示单词详细信息
  const [selectedWord, setSelectedWord] = useState({ blockId: null, wordIdx: null });
  const [wordDetails, setWordDetails] = useState(null);


  // 重排ID为连续自然数
  const reorderIds = (blocks) => {
    return blocks.map((block, index) => ({ ...block, id: index }));
  };

  // 处理文件上传
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      const blocks = content.split('\n')
        .map((line, index) => ({
          id: index,
          text: line.trim(),
          parsed: null,
          translated: null,
          wordDetails: {}
        }))
        .filter(block => block.text.length > 0);
      
      setTextBlocks(blocks);
    };
    reader.readAsText(file);
  };

  // 处理文本区域变化（实时分段）
  const handleTextChange = (e, blockId) => {
    const newText = e.target.value;
    const lines = newText.split('\n');
    
    if (lines.length === 1) {
      setTextBlocks(prev => prev.map(block => 
        block.id === blockId ? { ...block, text: newText } : block
      ));
      return;
    }

    const currentIndex = textBlocks.findIndex(b => b.id === blockId);
    let newBlocks = [...textBlocks];
    
    // 更新当前块为第一行
    newBlocks[currentIndex] = { ...newBlocks[currentIndex], text: lines[0].trim() };
    
    // 添加新块
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line) {
        newBlocks.splice(currentIndex + i, 0, {
          id: Date.now() + i,
          text: line,
          parsed: null,
          translated: null,
          wordDetails: {}
        });
      }
    }
    
    // 重排ID
    newBlocks = reorderIds(newBlocks);
    setTextBlocks(newBlocks);
  };

  // 调用大模型API
  const callApi = async (prompt, apiKey) => {
    if (!apiKey) {
      alert('请先输入API密钥');
      return null;
    }
    
    setIsLoading(true);
    try {
      const response = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: "Qwen/Qwen3-8B",
          messages: [
            { role: "user", content: prompt } // 发送的提示信息
          ],
          stream: false,
          max_tokens: 4096,
          enable_thinking: false,
          min_p: 0.05,
          temperature: 0.7,
          top_p: 0.7,
          top_k: 50,
          frequency_penalty: 0.5,
          n: 1,
          stop: [],
          response_format: { type: "text" },
        })
      });

      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API调用失败:', error);
      alert('网络请求失败，请检查连接');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

const handleAnalyze = async (blockId) => {
  // 第一步：调用大模型进行分词
  const segmentPrompt = `请将以下文本严格拆分为单词列表（用空格分隔，仅返回单词，无需其他内容）：\n${textBlocks[blockId].text}`;
  const segmentData = await callApi(segmentPrompt, apiKey);

  if (!segmentData || !segmentData.choices || !segmentData.choices[0].message.content) {
    alert('分词失败，请检查输入内容或API连接');
    return;
  }

  // 处理分词结果
  const words = segmentData.choices[0].message.content
    .trim()
    .split(' ')
    .filter(word => word.length > 0);

  if (words.length === 0) {
    alert('未检测到有效单词');
    return;
  }

  // 第二步：设置查询单词详情（文本格式）
  const wordDetails = {};
  for (const word of words) {
    wordDetails[word] = { word, meaning: 'Waiting……'};
  }

  // 更新状态（假设 textBlocks 中有 wordDetails 字段）
  setTextBlocks(prev => prev.map(block => 
    block.id === blockId ? { 
      ...block, 
      parsed: words, 
      wordDetails: wordDetails 
    } : block
  ));
};


  // 翻译函数，支持每段独立翻译
  const handleTranslate = async (blockId) => {
    const prompt = `请将以下文本翻译为中文，要求忠实、流畅：\n${textBlocks[blockId].text}`;
    const data = await callApi(prompt, apiKey);
    if (data && data.choices && data.choices[0].message.content) {
      setTextBlocks(prev => prev.map(block =>
        block.id === blockId ? { ...block, translated: data.choices[0].message.content } : block
      ));
    } else {
      alert('翻译失败或API异常');
    }
  };

  // 翻译函数，支持每段独立翻译
  const handleTeaching = async (blockId) => {
    const prompt = `对以下文本进行语法讲解，只需要分析整体句式结构：\n${textBlocks[blockId].text}`;
    const data = await callApi(prompt, apiKey);
    if (data && data.choices && data.choices[0].message.content) {
      setTextBlocks(prev => prev.map(block =>
        block.id === blockId ? { ...block, analysis: data.choices[0].message.content } : block
      ));
    } else {
      alert('翻译失败或API异常');
    }
  };

  // 渲染单词按钮和弹窗
  const renderWordButtons = (detailsArr, blockId) => {
    if (!detailsArr || !Array.isArray(detailsArr) || detailsArr.length === 0) return <p>无解析结果</p>;
    return (
      <div className="flex flex-wrap gap-2 mb-2">
        {detailsArr.map((item, idx) => (
          <button
            key={idx}
            className={`px-3 py-1 rounded border ${selectedWord.blockId === blockId && selectedWord.wordIdx === idx ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-blue-100'}`}
            onClick={() => setSelectedWord({ blockId, wordIdx: idx })}
            style={{
  display: 'inline-block',
  fontSize: '14px',
  fontWeight: 'bold',
  textAlign: 'center',
  color: '#ffffff',
  backgroundColor: '#87CEFA', // 淡蓝色
  border: 'none',
  borderRadius: '4px',
  padding: '4px 6px',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  cursor: 'pointer',
  transition: 'background-color 0.3s, transform 0.2s',
  margin: '2px 0.5%', // 增加上下间距
  verticalAlign: 'middle', // 垂直居中对齐
}}
          >
            {item || ''}
          </button>
        ))}
      </div>
    );
  };

  // 修改后的弹窗渲染函数（同步）
  const renderWordModal = () => {
    if (selectedWord.blockId === null || selectedWord.wordIdx === null) {
      return null;
    }

    const block = textBlocks.find(b => b.id === selectedWord.blockId);
    if (!block || !block.parsed) {
      return null;
    }

    const word = block.parsed[selectedWord.wordIdx];
    const details = wordDetails || { word, meaning: 'Waiting……' }; // 使用状态中的数据

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
        <div className="bg-white rounded-lg shadow-xl p-6 min-w-[300px] max-w-md relative transform transition-all">
          <div className="mb-4">
            <h3 className="text-xl font-bold text-gray-800 mb-2">{details.word}</h3>
            <ReactMarkdown>{details.meaning}</ReactMarkdown>
          </div>
          <button
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-xl"
            onClick={() => setSelectedWord({ blockId: null, wordIdx: null })}
            style={{
              display: 'inline-block',
              width: '15%',
              padding: '4px 6px',
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
              margin: '2px 0.5%', // 增加上下间距
            }}
          >
            ×
          </button>
        </div>
      </div>
    );
  };

  useEffect(() => {
    const fetchWordDetails = async () => {
      if (selectedWord.blockId === null || selectedWord.wordIdx === null) {
        setWordDetails(null);
        return;
      }

      const block = textBlocks.find(b => b.id === selectedWord.blockId);
      if (!block || !block.parsed) {
        setWordDetails(null);
        return;
      }

      const word = block.parsed[selectedWord.wordIdx];
      const detailPrompt = `请用中文提供句子"${block.text}"中单词 "${word}" 的解析，包含以下信息：
      1. 原型（baseForm）
      2. 中文含义（meaning）
      3. 语法地位（syntax）
      要求：用简洁文本表示，不需要JSON格式`;

      const detailData = await callApi(detailPrompt, apiKey);

      if (detailData && detailData.choices && detailData.choices[0].message.content) {
        try {
          const detailContent = detailData.choices[0].message.content.trim();
          setWordDetails({
            word,
            meaning: detailContent || '无',
          });
        } catch (error) {
          console.error(`单词 ${word} 解析失败：`, error);
          setWordDetails({ word, meaning: '解析失败' });
        }
      } else {
        setWordDetails({ word, meaning: '无' });
      }
    };

    // 仅在 selectedWord 变化时触发请求
    if (selectedWord.blockId !== null && selectedWord.wordIdx !== null) {
      fetchWordDetails();
    } else {
      setWordDetails(null); // 重置状态当弹窗关闭时
    }
  }, [selectedWord, textBlocks, apiKey]); // 依赖项包含触发更新的变量

  return (
    <div className="container mx-auto p-4 max-w-5xl" style={{ background: '#f6faff', minHeight: '100vh', borderRadius: 24, boxShadow: '0 4px 32px 0 rgba(59,130,246,0.08)', padding: '32px 0' }}>
      {/* 文件上传与API密钥区域 */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
        alignItems: 'stretch',
        marginBottom: 36,
        padding: '0 24px',
      }}>
        <div style={{ display: 'flex', gap: 18, alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => fileInputRef.current.click()}
            style={{
              display: 'inline-block',
              padding: '10px 28px',
              fontSize: 16,
              fontWeight: 600,
              color: '#fff',
              background: 'linear-gradient(90deg,#60a5fa 0%,#2563eb 100%)',
              border: 'none',
              borderRadius: 10,
              boxShadow: '0 2px 8px #2563eb22',
              cursor: 'pointer',
              transition: 'background 0.2s',
              marginRight: 8,
            }}
          >
            <i className="fa fa-upload mr-2"></i> 选择TXT文件
          </button>
          <input
            type="file"
            ref={fileInputRef}
            accept=".txt"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
        </div>
        <div style={{ maxWidth: 340 }}>
          <label htmlFor="apiKey" style={{ display: 'block', fontSize: 15, fontWeight: 500, color: '#2563eb', marginBottom: 6 }}>API密钥</label>
          <input
            type="password"
            id="apiKey"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="输入你的API密钥"
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '2px solid #60a5fa',
              borderRadius: 10,
              fontSize: 15,
              background: '#fff',
              boxShadow: '0 1.5px 6px 0 rgba(59,130,246,0.10)',
              marginBottom: 8,
              outline: 'none',
              transition: 'border 0.2s',
            }}
          />
          <div style={{ color: '#aaa', fontSize: 13 }}>提示：输入时按Enter键自动创建新段落</div>
        </div>
      </div>

      {/* 文本块区域 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 32, padding: '0 24px' }}>
        {textBlocks.map((block) => (
          <div
            key={block.id}
            style={{
              background: '#fff',
              border: '1.5px solid #60a5fa',
              borderRadius: 16,
              boxShadow: '0 4px 24px 0 rgba(59,130,246,0.10)',
              padding: 28,
              margin: '0 auto',
              position: 'relative',
              transition: 'box-shadow 0.2s',
              width: '100%',
              maxWidth: 900,
            }}
          >

            <div style={{ marginBottom: 18 }}>
              <textarea
                ref={(el) => textareaRefs.current[block.id] = el}
                value={block.text}
                onChange={(e) => handleTextChange(e, block.id)}
                placeholder="请输入或粘贴文本（按Enter自动分段）"
                rows={3}
                style={{
                  width: '100%',
                  minHeight: 60,
                  borderRadius: 10,
                  border: '1.5px solid #dbeafe',
                  background: '#f8fafc',
                  fontFamily: 'inherit',
                  fontSize: 17,
                  padding: '14px 16px',
                  marginBottom: 8,
                  boxShadow: '0 1.5px 6px 0 rgba(59,130,246,0.06)',
                  outline: 'none',
                  resize: 'vertical',
                  transition: 'border 0.2s',
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 10 }}>
              <button
                onClick={() => handleAnalyze(block.id)}
                disabled={isLoading || !block.text.trim()}
                style={{
                  padding: '7px 18px',
                  fontSize: 15,
                  fontWeight: 600,
                  color: '#fff',
                  background: '#38bdf8',
                  border: 'none',
                  borderRadius: 8,
                  boxShadow: '0 1px 4px #2563eb11',
                  cursor: isLoading || !block.text.trim() ? 'not-allowed' : 'pointer',
                  opacity: isLoading || !block.text.trim() ? 0.6 : 1,
                  transition: 'background 0.2s',
                }}
              >
                <i className="fa fa-sitemap mr-2"></i> 解析单词
              </button>
              <button
                onClick={() => handleTranslate(block.id)}
                disabled={isLoading || !block.text.trim()}
                style={{
                  padding: '7px 18px',
                  fontSize: 15,
                  fontWeight: 600,
                  color: '#fff',
                  background: '#a78bfa',
                  border: 'none',
                  borderRadius: 8,
                  boxShadow: '0 1px 4px #2563eb11',
                  cursor: isLoading || !block.text.trim() ? 'not-allowed' : 'pointer',
                  opacity: isLoading || !block.text.trim() ? 0.6 : 1,
                  transition: 'background 0.2s',
                }}
              >
                <i className="fa fa-language mr-2"></i> 翻译文本
              </button>
              <button
                onClick={() => handleTeaching(block.id)}
                disabled={isLoading || !block.text.trim()}
                style={{
                  padding: '7px 18px',
                  fontSize: 15,
                  fontWeight: 600,
                  color: '#fff',
                  background: '#f59e42',
                  border: 'none',
                  borderRadius: 8,
                  boxShadow: '0 1px 4px #2563eb11',
                  cursor: isLoading || !block.text.trim() ? 'not-allowed' : 'pointer',
                  opacity: isLoading || !block.text.trim() ? 0.6 : 1,
                  transition: 'background 0.2s',
                }}
              >
                <i className="fa fa-language mr-2"></i> 语法讲解
              </button>
              {textBlocks.length > 1 && (
                <button
                  onClick={() => {
                    setTextBlocks(prev => {
                      const newBlocks = prev.filter(b => b.id !== block.id);
                      return reorderIds(newBlocks);
                    });
                  }}
                  style={{
                    padding: '7px 18px',
                    fontSize: 15,
                    fontWeight: 600,
                    color: '#fff',
                    background: '#ef4444',
                    border: 'none',
                    borderRadius: 8,
                    boxShadow: '0 1px 4px #2563eb11',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                  }}
                >
                  <i className="fa fa-trash mr-1"></i> 删除
                </button>
              )}
            </div>
            {/* 解析结果显示 */}
            {block.parsed && (
              <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 12, marginTop: 8 }}>
                {renderWordButtons(block.parsed, block.id)}
                {renderWordModal(block)}
              </div>
            )}
            {/* 翻译结果显示 */}
            {block.translated && (
              <div style={{ marginTop: 14 }}>
                <div style={{ background: '#ede9fe', padding: '12px 16px', borderRadius: 8, color: '#4b2995', fontSize: 16 }}>
                  {block.translated}
                </div>
              </div>
            )}
            {/* 语法讲解显示 */}
            {block.analysis && (
              <div style={{ marginTop: 14 }}>
                <div style={{ background: '#fef3c7', padding: '12px 16px', borderRadius: 8, color: '#b45309', fontSize: 16 }}>
                  <ReactMarkdown>{block.analysis}</ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      {/* 加载状态 */}
      {isLoading && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', padding: 32, borderRadius: 16, boxShadow: '0 4px 24px 0 rgba(59,130,246,0.10)' }}>
            <div style={{ width: 40, height: 40, border: '4px solid #60a5fa', borderTop: '4px solid #2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 18px' }}></div>
            <p style={{ fontSize: 18, color: '#2563eb', textAlign: 'center' }}>正在请求大模型服务，请稍候...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageReader;