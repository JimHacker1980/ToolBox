import React, { useState } from 'react';

const PUBLIC_JSON_FILES = [
  {
    name: '最优化：建模、算法与理论（刘浩洋、户将、李勇锋、文再文编著）',
    path: '/最优化.json',
  },
];

const FileUploader = ({ onFileUpload }) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showPublicDialog, setShowPublicDialog] = useState(false);
  const [publicLoading, setPublicLoading] = useState(false);

  const handleDragEnter = (e) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragActive(false);

    if (e.dataTransfer.files.length) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/json' || file.name.endsWith('.json')) {
        setUploading(true);
        setTimeout(() => {
          readJsonFile(file);
          setUploading(false);
        }, 500);
      } else {
        alert('请上传JSON文件(.json)');
      }
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploading(true);
      setTimeout(() => {
        readJsonFile(file);
        setUploading(false);
      }, 500);
    }
  };

  const readJsonFile = (file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const jsonContent = JSON.parse(event.target.result);
        onFileUpload(jsonContent);
      } catch (error) {
        console.error("Invalid JSON file:", error);
        alert("文件内容不是有效的JSON格式，请检查后重新上传。");
      }
    };
    reader.readAsText(file);
  };

  // 处理 public 目录文件导入
  const handleImportPublicFile = async (filePath) => {
    setPublicLoading(true);
    try {
      const res = await fetch(process.env.PUBLIC_URL ? process.env.PUBLIC_URL + filePath : filePath);
      if (!res.ok) throw new Error('文件读取失败');
      const jsonContent = await res.json();
      onFileUpload(jsonContent);
      setShowPublicDialog(false);
    } catch (e) {
      alert('读取 public 目录文件失败: ' + e.message);
    } finally {
      setPublicLoading(false);
    }
  };

  return (
    <div style={{ marginBottom: 24, display: 'flex', alignItems: 'flex-start', gap: 16 }}>
      {/* 拖拽+按钮整体区域 */}
      <div
        style={{
          border: isDragActive ? '2px dashed #2563eb' : '2px dashed #d1d5db',
          background: isDragActive ? '#e0edff' : '#f8fafc',
          borderRadius: 12,
          width: 210,
          minWidth: 120,
          minHeight: 56,
          textAlign: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          boxShadow: '0 2px 8px 0 rgba(59,130,246,0.08)',
          transition: 'all 0.3s',
          fontSize: 13,
          color: '#2563eb',
          padding: '0 10px',
          gap: 10,
        }}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <label htmlFor="file-upload" style={{
          display: 'inline-block',
          padding: '8px 18px',
          fontSize: 15,
          fontWeight: 700,
          color: '#fff',
          background: 'linear-gradient(90deg,#60a5fa 0%,#2563eb 100%)',
          border: 'none',
          borderRadius: 8,
          boxShadow: '0 2px 8px #2563eb22',
          cursor: 'pointer',
          transition: 'background 0.2s',
          marginRight: 0,
          marginBottom: 0,
        }}>
          上传JSON文件
        </label>
        <input
          type="file"
          id="file-upload"
          accept=".json"
          className="hidden"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
        {uploading ? (
          <div style={{ width: 24, height: 24, border: '3px solid #60a5fa', borderTop: '3px solid #2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite', marginLeft: 8 }}></div>
        ) : (
          <span style={{ marginLeft: 8 }}>或拖拽上传</span>
        )}
      </div>
      {/* 导入 public 目录文件按钮 */}
      <button
        style={{
          padding: '8px 18px',
          fontSize: 15,
          fontWeight: 700,
          color: '#2563eb',
          background: '#e0edff',
          border: '1.5px solid #2563eb',
          borderRadius: 8,
          boxShadow: '0 2px 8px #2563eb11',
          cursor: 'pointer',
          marginLeft: 0,
          marginBottom: 0,
          transition: 'background 0.2s',
        }}
        onClick={() => setShowPublicDialog(true)}
      >
        导入网站已有的JSON文件
      </button>
      {/* public 目录文件选择弹窗 */}
      {showPublicDialog && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.18)',
          zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 14,
            minWidth: 320,
            maxWidth: 400,
            boxShadow: '0 4px 32px #2563eb22',
            padding: 28,
            position: 'relative',
            display: 'flex', flexDirection: 'column', gap: 18,
          }}>
            <div style={{ fontWeight: 700, fontSize: 18, color: '#2563eb', marginBottom: 8 }}>选择网站目录下的 JSON 文件</div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {PUBLIC_JSON_FILES.map(f => (
                <li key={f.path} style={{ marginBottom: 8 }}>
                  <button
                    disabled={publicLoading}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '8px 12px',
                      borderRadius: 7,
                      border: '1.5px solid #2563eb',
                      background: '#f8fafc',
                      color: '#2563eb',
                      fontWeight: 600,
                      fontSize: 15,
                      cursor: publicLoading ? 'not-allowed' : 'pointer',
                      opacity: publicLoading ? 0.6 : 1,
                      transition: 'background 0.2s',
                    }}
                    onClick={() => handleImportPublicFile(f.path)}
                  >
                    {f.name}
                  </button>
                </li>
              ))}
            </ul>
            <button
              style={{
                position: 'absolute',
                top: 12, right: 16,
                background: 'none',
                border: 'none',
                color: '#2563eb',
                fontSize: 22,
                fontWeight: 700,
                cursor: 'pointer',
              }}
              onClick={() => setShowPublicDialog(false)}
              title="关闭"
            >×</button>
            {publicLoading && <div style={{ color: '#2563eb', fontSize: 15, marginTop: 8 }}>正在加载...</div>}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploader;