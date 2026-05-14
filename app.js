document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const statusArea = document.getElementById('status-area');
    const resultArea = document.getElementById('result-area');
    const downloadBtn = document.getElementById('download-btn');
    const resetBtn = document.getElementById('reset-btn');
    const resultInfo = document.getElementById('result-info');
    const statusText = document.querySelector('#status-area p');

    // --- CONFIGURAÇÃO ---
    const API_URL = '/compress';
    const CLOUDINARY_UPLOAD_PRESET = 'pdf8ever_upload'; // Certifique-se de que é UNSIGNED
    const CLOUDINARY_CLOUD_NAME = 'doxx9wyvw';

    // Click to select file
    dropZone.addEventListener('click', () => fileInput.click());

    // File input change
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
    });

    // Drag and drop events
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => dropZone.classList.add('drag-over'), false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => dropZone.classList.remove('drag-over'), false);
    });

    dropZone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const file = dt.files[0];
        handleFile(file);
    });

    async function handleFile(file) {
        if (!file || file.type !== 'application/pdf') {
            alert('Por favor, envie apenas arquivos PDF.');
            return;
        }

        // UI State: Loading
        dropZone.classList.add('hidden');
        statusArea.classList.remove('hidden');
        statusText.innerText = 'Subindo arquivo pesado para a nuvem...';

        try {
            // 1. Upload para o Cloudinary (Fura o limite de 4.5MB da Vercel)
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

            const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`, {
                method: 'POST',
                body: formData
            });

            if (!uploadRes.ok) {
                const err = await uploadRes.json();
                throw new Error(`Erro no Cloudinary: ${err.error.message}`);
            }

            const uploadData = await uploadRes.json();
            const uploadedUrl = uploadData.secure_url;

            statusText.innerText = 'Esmagando PDF... isso pode levar alguns segundos.';

            // 2. Chama o Motor na Vercel passando a URL
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    url: uploadedUrl,
                    filename: file.name
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Erro ao processar o arquivo.');
            }

            const data = await response.json();
            
            // Setup Download Button
            downloadBtn.href = data.url;
            downloadBtn.download = data.filename;

            // UI State: Success
            statusArea.classList.add('hidden');
            resultArea.classList.remove('hidden');
            resultInfo.innerText = `Seu arquivo "${file.name}" foi esmagado com sucesso!`;

        } catch (error) {
            console.error('Erro:', error);
            alert(`Ops! Algo deu errado: ${error.message}\n\nVerifique se o Upload Preset "${CLOUDINARY_UPLOAD_PRESET}" está configurado como UNSIGNED no Cloudinary.`);
            resetUI();
        }
    }

    resetBtn.addEventListener('click', resetUI);

    function resetUI() {
        dropZone.classList.remove('hidden');
        statusArea.classList.add('hidden');
        resultArea.classList.add('hidden');
        fileInput.value = '';
    }

    // --- CANVAS ANIMATION ---
    const canvas = document.getElementById('bg-canvas');
    const ctx = canvas.getContext('2d');

    let width, height, particles;

    function init() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        particles = [];
        for (let i = 0; i < 50; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 2 + 1
            });
        }
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = 'rgba(0, 242, 254, 0.2)';
        
        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;

            if (p.x < 0) p.x = width;
            if (p.x > width) p.x = 0;
            if (p.y < 0) p.y = height;
            if (p.y > height) p.y = 0;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        });

        requestAnimationFrame(animate);
    }

    window.addEventListener('resize', init);
    init();
    animate();
});
