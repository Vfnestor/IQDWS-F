// ابزار برش و فشرده‌سازی عکس
const ImageUtils = {
    cropper: null,
    
    openCropModal: function(file, callback) {
        const reader = new FileReader();
        reader.onload = (e) => {
            // ساخت مودال برای برش
            Utils.openModal(`
                <h3 style="margin-bottom:15px;">برش و بهینه‌سازی عکس</h3>
                <div style="max-height: 400px; overflow: hidden; margin-bottom: 15px;">
                    <img id="crop-image" src="${e.target.result}" style="max-width: 100%;">
                </div>
                <button class="btn btn-primary" style="width:100%;" onclick="ImageUtils.saveCropped()">تایید و فشرده‌سازی</button>
            `);

            // راه‌اندازی کتابخانه Cropper.js
            const image = document.getElementById('crop-image');
            this.cropper = new Cropper(image, {
                aspectRatio: 4 / 3,
                viewMode: 1,
                autoCropArea: 0.8
            });

            // ذخیره callback برای استفاده پس از برش
            this.onSaveCallback = callback;
        };
        reader.readAsDataURL(file);
    },

    saveCropped: function() {
        if (!this.cropper) return;
        
        // گرفتن بوم برش‌خورده
        const canvas = this.cropper.getCroppedCanvas({
            maxWidth: 1024,
            maxHeight: 768
        });

        // تبدیل به JPEG با کیفیت ۷۰٪ (کاهش حجم بدون افت کیفیت محسوس)
        const base64Image = canvas.toDataURL('image/jpeg', 0.7);
        
        this.cropper.destroy();
        Utils.closeModal();
        
        if (this.onSaveCallback) {
            this.onSaveCallback(base64Image);
        }
    }
};