// 获取DOM元素
const fileInput = document.getElementById('fileInput');
const dropZone = document.getElementById('dropZone');
const originalImage = document.getElementById('originalImage');
const compressedImage = document.getElementById('compressedImage');
const originalSize = document.getElementById('originalSize');
const originalFileSize = document.getElementById('originalFileSize');
const compressedSize = document.getElementById('compressedSize');
const compressedFileSize = document.getElementById('compressedFileSize');
const savedSize = document.getElementById('savedSize');
const qualitySlider = document.getElementById('qualitySlider');
const qualityValue = document.getElementById('qualityValue');
const compressButton = document.getElementById('compressButton');
const downloadButton = document.getElementById('downloadButton');
const resetButton = document.getElementById('resetButton');
const uploadArea = document.getElementById('uploadArea');
const compressionControlArea = document.getElementById('compressionControlArea');
const comparisonArea = document.getElementById('comparisonArea');
const actionArea = document.getElementById('actionArea');

// 全局变量
let originalFile = null;
let compressedImageData = null;
let originalImageData = null;

// 初始化
function init() {
    // 文件选择事件
    fileInput.addEventListener('change', handleFileSelect);
    
    // 拖放事件
    dropZone.addEventListener('dragover', handleDragOver);
    dropZone.addEventListener('dragleave', handleDragLeave);
    dropZone.addEventListener('drop', handleDrop);
    dropZone.addEventListener('click', () => fileInput.click());
    
    // 滑块事件
    qualitySlider.addEventListener('input', updateQualityValue);
    
    // 按钮事件
    compressButton.addEventListener('click', compressImage);
    downloadButton.addEventListener('click', downloadImage);
    resetButton.addEventListener('click', resetApp);
}

// 更新质量滑块值显示
function updateQualityValue() {
    qualityValue.textContent = `${qualitySlider.value}%`;
}

// 处理文件选择
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file && isValidImageType(file)) {
        processFile(file);
    }
}

// 处理拖放
function handleDragOver(event) {
    event.preventDefault();
    event.stopPropagation();
    dropZone.classList.add('dragging');
}

function handleDragLeave(event) {
    event.preventDefault();
    event.stopPropagation();
    dropZone.classList.remove('dragging');
}

function handleDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    dropZone.classList.remove('dragging');
    
    const file = event.dataTransfer.files[0];
    if (file && isValidImageType(file)) {
        processFile(file);
    }
}

// 检查文件类型是否有效
function isValidImageType(file) {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    return validTypes.includes(file.type);
}

// 处理选择的文件
function processFile(file) {
    originalFile = file;
    
    // 读取并显示原始图片
    const reader = new FileReader();
    reader.onload = function(e) {
        originalImageData = e.target.result;
        originalImage.src = originalImageData;
        
        // 获取并显示原始图片信息
        const img = new Image();
        img.onload = function() {
            originalSize.textContent = `${img.width} x ${img.height}`;
            originalFileSize.textContent = formatFileSize(file.size);
            
            // 显示预览区域和控制区域
            compressionControlArea.style.display = 'block';
            compressionControlArea.classList.add('fade-in');
            comparisonArea.style.display = 'grid';
            comparisonArea.classList.add('fade-in');
        };
        img.src = originalImageData;
    };
    reader.readAsDataURL(file);
}

// 压缩图片
function compressImage() {
    if (!originalFile) return;
    
    const img = new Image();
    img.onload = function() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // 保持原始尺寸
        canvas.width = img.width;
        canvas.height = img.height;
        
        // 绘制图片到canvas
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // 获取压缩质量
        const quality = parseInt(qualitySlider.value) / 100;
        
        // 根据文件类型压缩
        const mimeType = originalFile.type;
        compressedImageData = canvas.toDataURL(mimeType, quality);
        
        // 显示压缩后的图片
        compressedImage.src = compressedImageData;
        
        // 计算压缩后的文件大小
        getCompressedFileSize(compressedImageData, function(size) {
            const originalSizeBytes = originalFile.size;
            const compressedSizeBytes = size;
            const savedSizeBytes = originalSizeBytes - compressedSizeBytes;
            const savingPercentage = Math.round((savedSizeBytes / originalSizeBytes) * 100);
            
            compressedSize.textContent = `${img.width} x ${img.height}`;
            compressedFileSize.textContent = formatFileSize(compressedSizeBytes);
            savedSize.textContent = `${formatFileSize(savedSizeBytes)} (${savingPercentage}%)`;
            
            // 启用下载按钮
            downloadButton.disabled = false;
            
            // 显示操作区域
            actionArea.style.display = 'flex';
            actionArea.classList.add('fade-in');
        });
    };
    img.src = originalImageData;
}

// 获取压缩后的文件大小
function getCompressedFileSize(dataURL, callback) {
    const binary = atob(dataURL.split(',')[1]);
    const array = [];
    for (let i = 0; i < binary.length; i++) {
        array.push(binary.charCodeAt(i));
    }
    const blob = new Blob([new Uint8Array(array)], {type: originalFile.type});
    callback(blob.size);
}

// 下载压缩后的图片
function downloadImage() {
    if (!compressedImageData) return;
    
    // 创建下载链接
    const link = document.createElement('a');
    link.download = `compressed_${originalFile.name}`;
    link.href = compressedImageData;
    link.click();
}

// 重置应用
function resetApp() {
    // 清除图片
    originalImage.src = '';
    compressedImage.src = '';
    
    // 重置文件信息
    originalSize.textContent = '-';
    originalFileSize.textContent = '-';
    compressedSize.textContent = '-';
    compressedFileSize.textContent = '-';
    savedSize.textContent = '-';
    
    // 重置文件输入
    fileInput.value = '';
    originalFile = null;
    compressedImageData = null;
    originalImageData = null;
    
    // 重置质量滑块
    qualitySlider.value = 80;
    updateQualityValue();
    
    // 禁用下载按钮
    downloadButton.disabled = true;
    
    // 隐藏区域
    compressionControlArea.style.display = 'none';
    comparisonArea.style.display = 'none';
    actionArea.style.display = 'none';
}

// 格式化文件大小
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 初始化应用
document.addEventListener('DOMContentLoaded', init); 