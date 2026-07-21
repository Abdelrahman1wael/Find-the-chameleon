const bgUpload = document.getElementById('bg-upload');
const overlayUpload = document.getElementById('overlay-upload');
const scaleSlider = document.getElementById('scale');
const angleSlider = document.getElementById('angle');
const posXSlider = document.getElementById('posX');
const posYSlider = document.getElementById('posY');
const opacitySlider = document.getElementById('opacity');
const downloadBtn = document.getElementById('download-btn');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const placeholder = document.getElementById('placeholder');
const slidersDiv = document.getElementById('sliders');

// Values for the UI
const scaleVal = document.getElementById('scale-val');
const angleVal = document.getElementById('angle-val');
const xVal = document.getElementById('x-val');
const yVal = document.getElementById('y-val');
const opacityVal = document.getElementById('opacity-val');

let bgImage = null;
let overlayImage = null;

bgUpload.addEventListener('change', (e) => handleImageUpload(e, 'bg'));
overlayUpload.addEventListener('change', (e) => handleImageUpload(e, 'overlay'));

scaleSlider.addEventListener('input', updateCanvas);
angleSlider.addEventListener('input', updateCanvas);
posXSlider.addEventListener('input', updateCanvas);
posYSlider.addEventListener('input', updateCanvas);
opacitySlider.addEventListener('input', updateCanvas);

function handleImageUpload(e, type) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
            if (type === 'bg') {
                bgImage = img;
            } else {
                overlayImage = img;
            }
            checkImages();
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
}

function checkImages() {
    if (bgImage) {
        placeholder.style.display = 'none';
        canvas.style.display = 'block';
    }
    
    if (bgImage && overlayImage) {
        slidersDiv.style.opacity = '1';
        slidersDiv.style.pointerEvents = 'auto';
        downloadBtn.disabled = false;
    }
    
    updateCanvas();
}

function updateCanvas() {
    if (!bgImage) return;

    // Set canvas dimensions to fill the preview panel while maintaining aspect ratio
    const panel = canvas.parentElement;
    const panelRect = panel.getBoundingClientRect();
    const padding = 32; // 2rem padding on each side
    const maxW = panelRect.width - padding * 2;
    const maxH = panelRect.height - padding * 2;
    
    const aspectRatio = bgImage.width / bgImage.height;
    let w, h;
    if (maxW / maxH > aspectRatio) {
        h = maxH;
        w = h * aspectRatio;
    } else {
        w = maxW;
        h = w / aspectRatio;
    }
    canvas.width = w;
    canvas.height = h;

    // Draw background
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);

    if (overlayImage) {
        // Grab values from sliders
        const scale = scaleSlider.value / 100;
        const angle = angleSlider.value * Math.PI / 180;
        
        // Update labels in the UI
        scaleVal.innerText = scaleSlider.value;
        angleVal.innerText = angleSlider.value;
        xVal.innerText = posXSlider.value;
        yVal.innerText = posYSlider.value;
        opacityVal.innerText = opacitySlider.value;

        // Position percentages converted to actual pixels relative to background
        const xPos = (posXSlider.value / 100) * canvas.width;
        const yPos = (posYSlider.value / 100) * canvas.height;

        ctx.save();
        
        // Apply opacity
        ctx.globalAlpha = opacitySlider.value / 100;
        
        // Translate to the selected (X, Y) coordinate
        ctx.translate(xPos, yPos);
        
        // Apply rotation
        ctx.rotate(angle);
        
        // Apply scaling
        ctx.scale(scale, scale);
        
        // Draw overlay centered exactly at the translated origin point
        const overlayScaleX = canvas.width / bgImage.width;
        const overlayScaleY = canvas.height / bgImage.height;
        const ovW = overlayImage.width * overlayScaleX;
        const ovH = overlayImage.height * overlayScaleY;
        ctx.drawImage(
            overlayImage, 
            -ovW / 2, 
            -ovH / 2,
            ovW,
            ovH
        );
        
        ctx.restore();
        
        // Reset globalAlpha for future drawings
        ctx.globalAlpha = 1;
    }
}

// Download the resulting composited image
downloadBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'composited-image.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
});
