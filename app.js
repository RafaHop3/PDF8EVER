document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const statusArea = document.getElementById('status-area');
    const resultArea = document.getElementById('result-area');
    const downloadBtn = document.getElementById('download-btn');
    const resetBtn = document.getElementById('reset-btn');
    const resultInfo = document.getElementById('result-info');

    // --- CONFIGURAÇÃO ---
    // Após o deploy no Render, substitua a URL abaixo pela sua URL do Render
    // Exemplo: https://pdf8ever-motor.onrender.com/compress
    const API_URL = 'https://SUA-URL-AQUI.onrender.com/compress';


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

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Erro ao processar o arquivo.');
            }

            // Get the blob from response
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            
            // Setup Download Button
            downloadBtn.href = url;
            downloadBtn.download = `${file.name.split('.')[0]}_esmagado.pdf`;

            // UI State: Success
            statusArea.classList.add('hidden');
            resultArea.classList.remove('hidden');
            resultInfo.innerText = `Seu arquivo "${file.name}" foi esmagado com sucesso!`;

        } catch (error) {
            console.error('Erro:', error);
            alert(`Ops! Algo deu errado: ${error.message}`);
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
