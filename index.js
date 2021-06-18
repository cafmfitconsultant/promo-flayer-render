const PDFDocument = require('pdfkit');
const fs = require('fs');
const imageToBase64 = require('image-to-base64');
const a5PaperWidth = 436.54;
const a5PaperHeight = 612.81;
const doc = new PDFDocument({
    size: [a5PaperWidth, a5PaperHeight]
});
const QRCode = require('qrcode');
const getBase64ImageString = (path) => {
    return new Promise((resolve, reject) => {
        imageToBase64(path) // Path to the image
            .then(
                (response) => {
                    resolve(response); // "cGF0aC90by9maWxlLmpwZw=="
                }
            )
            .catch(
                (error) => {
                    reject(error); // Logs an error if there was one
                }
            )
    })
}
const generateQR = async (text) => {
    try {
        const result = await QRCode.toDataURL(text);
        return result;
    } catch (err) {
        console.error(err)
    }
}

const addCellphoneWithQrCodeImage = async (doc) => {
    const xCellPhone = 275;
    const yCellPhone = 250;
    const xQrCode = xCellPhone + 25;
    const yQrCode = yCellPhone + 120;
    const wQrCode = 100;
    const cellPhoneBase64Image = await getBase64ImageString('./images/celular.png');
    const cellPhoneImage = cellPhoneBase64Image.replace('data:image/png;base64,', '');
    doc.image(Buffer.from(cellPhoneImage, 'base64'), xCellPhone, yCellPhone, {scale: 0.5});
    const qrCodeInfo = 'That where is the magic happens';
    const qrCodeBase64Image = await generateQR(qrCodeInfo);
    const qrCode = qrCodeBase64Image.replace('data:image/png;base64,', '');
    doc.image(Buffer.from(qrCode, 'base64'), xQrCode, yQrCode, { width: wQrCode });
}

const addLogoImage = async (doc) => {
    const logoBase64 = await getBase64ImageString('./images/Logo cliente.png');
    const logo = logoBase64.replace('data:image/png;base64,', '');
    doc.image(Buffer.from(logo, 'base64'), 90, 60, { scale: 0.6 });
}

const addBottonLinesText = async (doc, redLineY, redLineX) => {
    const redLineTextStartPosition = redLineX + 90;
    const redLineTextCeilingPadding = redLineY + 5;
    const logoWhatsApp64 = await getBase64ImageString('./images/Logo WhatsApp.png');
    const logoWhats = logoWhatsApp64.replace('data:image/png;base64,', '');
    doc.image(Buffer.from(logoWhats, 'base64'), redLineTextStartPosition + 95, redLineTextCeilingPadding, { scale: 0.5  });
    doc.font('./images/Montserrat-Bold.ttf').fontSize(14)
        .text('Também no', redLineTextStartPosition, redLineTextCeilingPadding).fill('white');
    doc.font('./images/Montserrat-Bold.ttf').fontSize(14)
        .text('(15) 99691-0485', redLineTextStartPosition + 120, redLineTextCeilingPadding).fill('white');

    
}

const addBottonLines = async (doc) => {
    const redLineY = 500;
    const redLineX = 0;
    const redLineHeight = 30;
    const whiteLineY = redLineY + redLineHeight;
    const whiteLineX = 0;
    const whiteLineHeight = 100;
    doc.rect(redLineX, redLineY, a5PaperWidth, redLineHeight).fill('red');
    doc.rect(whiteLineX, whiteLineY, a5PaperWidth, whiteLineHeight).fill('white');
    await addBottonLinesText(doc, redLineY, redLineX);
}
const createPDF = async (qrCodeInfo) => {
    doc.rect(0, 0, 500, 800).fill('#FFC31F');
    await addCellphoneWithQrCodeImage(doc);
    await addLogoImage(doc);
    await addBottonLines(doc)
    doc.pipe(fs.createWriteStream('flyer.pdf'));
    doc.end();
}

createPDF();

