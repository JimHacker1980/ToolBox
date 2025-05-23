import React, { useState } from 'react';

const FileUploader = ({ onFileUpload }) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);

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

  return (
    <div style={{ marginBottom: 24, display: 'flex', alignItems: 'flex-start' }}>
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
    </div>
  );
};

export default FileUploader;