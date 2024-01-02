// steganography.js

let textHidden = false;
const delimiter = '\n$END$';

function loadImage() {
    const inputElement = document.getElementById('imageInput');
    const encryptionCanvas = document.getElementById('encryptionCanvas');

    const file = inputElement.files[0];

    if (file) {
        const reader = new FileReader();

        reader.onload = function (e) {
            const image = new Image();
            image.src = e.target.result;

            image.onload = function () {
                const ctx = encryptionCanvas.getContext('2d');
                ctx.clearRect(0, 0, encryptionCanvas.width, encryptionCanvas.height);
                ctx.drawImage(image, 0, 0, encryptionCanvas.width, encryptionCanvas.height);
            };
        };

        reader.readAsDataURL(file);
    }
}

function hideText() {
    const inputText = document.getElementById('inputText').value + delimiter;
    const encryptionCanvas = document.getElementById('encryptionCanvas');

    const ctx = encryptionCanvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, encryptionCanvas.width, encryptionCanvas.height);

    const encoder = new TextEncoder('utf-8');
    const encodedText = encoder.encode(inputText);

    let textIndex = 0;

    // Hide text in the least significant bit of the blue channel
    for (let i = 0; i < imageData.data.length && textIndex < encodedText.length * 8; i += 4) {
        const byteValue = encodedText[textIndex >> 3]; // Divide by 8 to get the byte index
        const bit = (byteValue >> (textIndex % 8)) & 1; // Get the next bit of the byte

        // Clear the least significant bit of the blue channel
        imageData.data[i + 2] &= 0b11111110;

        // Set the least significant bit to the current bit of the byte
        imageData.data[i + 2] |= bit;

        textIndex++;
    }

    ctx.putImageData(imageData, 0, 0);

    // Set the textHidden flag to true when text is hidden
    textHidden = true;
}

function downloadImage() {
    const encryptionCanvas = document.getElementById('encryptionCanvas');
    const ctx = encryptionCanvas.getContext('2d');

    // Check if the text has been hidden before allowing download
    if (!textHidden) {
        alert('Please hide text before downloading.');
        return;
    }

    const link = document.createElement('a');
    link.href = encryptionCanvas.toDataURL();
    link.download = 'encrypted_image.png';
    link.click();
}

function loadEncryptedImage() {
    const encryptedImageInput = document.getElementById('encryptedImageInput');
    const extractionCanvas = document.getElementById('extractionCanvas');

    const file = encryptedImageInput.files[0];

    if (!file) {
        console.error('No file selected.');
        return;
    }

    const reader = new FileReader();

    reader.onload = function (e) {
        const image = new Image();
        image.src = e.target.result;

        image.onload = function () {
            const ctx = extractionCanvas.getContext('2d');
            ctx.clearRect(0, 0, extractionCanvas.width, extractionCanvas.height);
            ctx.drawImage(image, 0, 0, extractionCanvas.width, extractionCanvas.height);
        };
    };

    reader.onerror = function (e) {
        console.error('Error loading the image:', e);
    };

    reader.readAsDataURL(file);
}

function extractText() {
    const encryptedImageInput = document.getElementById('encryptedImageInput');
    const extractionCanvas = document.getElementById('extractionCanvas');
    const extractedTextElement = document.getElementById('extractedText');

    const file = encryptedImageInput.files[0];

    if (!file) {
        alert('Please select an encrypted image before extracting text.');
        return;
    }

    const reader = new FileReader();

    reader.onload = function (e) {
        const image = new Image();
        image.src = e.target.result;

        image.onload = function () {
            const ctx = extractionCanvas.getContext('2d');
            ctx.clearRect(0, 0, extractionCanvas.width, extractionCanvas.height);
            ctx.drawImage(image, 0, 0, extractionCanvas.width, extractionCanvas.height);

            const imageData = ctx.getImageData(0, 0, extractionCanvas.width, extractionCanvas.height);

            if (!imageData) {
                console.error('Error extracting text: Image data not available.');
                return;
            }

            const decoder = new TextDecoder('utf-8');
            let decodedText = '';

            let byteValue = 0;
            let bitsProcessed = 0;

            // Extract text from the least significant bit of the blue channel
            for (let i = 0; i < imageData.data.length; i += 4) {
                const bit = imageData.data[i + 2] & 1; // Get the least significant bit of the blue channel
                byteValue |= (bit << bitsProcessed);

                bitsProcessed++;

                if (bitsProcessed === 8) {
                    decodedText += String.fromCharCode(byteValue);
                    byteValue = 0;
                    bitsProcessed = 0;

                    // Check if we have reached the end of the hidden text
                    if (decodedText.endsWith(delimiter)) {
                        break;
                    }
                }
            }

            // Remove the delimiter from the extracted text
            decodedText = decodedText.replace(delimiter, '');

            // Style the extracted text container
            extractedTextElement.innerHTML = '';
            const span = document.createElement('span');
            span.textContent = decodedText;
            span.style.backgroundColor = '#f0f0f0'; // Set background color
            span.style.padding = '5px'; // Add padding
            span.style.borderRadius = '5px'; // Add border radius
            extractedTextElement.appendChild(span);

            // Print the extracted text and exit from all functions
            console.log('Extracted Text:', decodedText);
            return;
        };
    };

    reader.onerror = function (e) {
        console.error('Error loading the image:', e);
    };

    reader.readAsDataURL(file);
}


