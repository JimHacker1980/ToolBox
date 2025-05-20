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
    <div className="mb-8">
      <div
        className={`border-2 border-dashed ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'} rounded-lg p-8 text-center transition-all duration-300 min-h-[200px] flex flex-col items-center justify-center`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        {uploading ? (
          <div className="flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-lg font-medium text-gray-700">正在处理文件...</p>
          </div>
        ) : (
          <>
            <input
              type="file"
              id="file-upload"
              accept=".json"
              className="hidden"
              onChange={handleFileSelect}
              style={{
                display: 'inline-block',
                width: '15%',
                padding: '8px 10px',
                fontSize: '14px',
                fontWeight: 'bold',
                textAlign: 'center',
                color: '#ffffff',
                backgroundColor: '#B0E0E6', // 淡蓝色
                border: 'none',
                borderRadius: '6px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                cursor: 'pointer',
                transition: 'background-color 0.3s, transform 0.2s',
                marginRight: '0.5%',
                marginBottom: '0.5%',
              }}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default FileUploader;