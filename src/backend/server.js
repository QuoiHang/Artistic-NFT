require('dotenv').config();

const express = require('express');
const axios = require('axios');
const multer = require('multer');
const cors = require('cors');
const FormData = require('form-data');
const fs = require('fs');
const upload = multer({ dest: 'uploads/' }); // Ensure 'uploads/' directory exists

const app = express();
app.use(cors());
app.use(express.json());

const port = 3001;

// Function to create JSON file from metadata
const createJsonFile = async (metadata, filename) => {
    const filePath = `uploads/${filename}.json`; // Define file path
    await fs.promises.writeFile(filePath, JSON.stringify(metadata)); // Write JSON data to file
    return filePath; // Return the file path for further use
};

app.post('/upload', upload.single('file'), async (req, res) => {
    const { name, description } = req.body;
    try {
        // First, upload the image file to Pinata
        const imageFormData = new FormData();
        imageFormData.append("file", fs.createReadStream(req.file.path)); // Corrected to fs.createReadStream
        const imageUploadResponse = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", imageFormData, {
            maxBodyLength: 'Infinity',
            headers: {
                'pinata_api_key': process.env.PINATA_API_KEY, // Ensure these are set in .env
                'pinata_secret_api_key': process.env.PINATA_SECRET_API_KEY,
                ...imageFormData.getHeaders(),
            },
        });
        const imageHash = imageUploadResponse.data.IpfsHash;

        // Create JSON metadata and upload
        const metadata = { name:`${name}`, description:`${description}`, image:`https://gateway.pinata.cloud/ipfs/${imageHash}` };
        const jsonFilename = `${name}-${Date.now()}`; // Ensures unique filename
        const jsonFilePath = await createJsonFile(metadata, jsonFilename);

        const jsonFormData = new FormData();
        jsonFormData.append("file", fs.createReadStream(jsonFilePath)); // Corrected to fs.createReadStream
        const jsonUploadResponse = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", jsonFormData, {
            headers: {
                'pinata_api_key': process.env.PINATA_API_KEY,
                'pinata_secret_api_key': process.env.PINATA_SECRET_API_KEY,
                ...jsonFormData.getHeaders(),
            },
        });

        const jsonHash = jsonUploadResponse.data.IpfsHash;

        // Clean up temporary files
        await fs.promises.unlink(req.file.path);
        await fs.promises.unlink(jsonFilePath);

        // Respond with IPFS hashes
        res.json({
            success: true,
            tokenURI: `https://gateway.pinata.cloud/ipfs/${jsonHash}`
        });

    } catch (error) {
        console.error("Error File to IPFS", error);
        if (error.response) {
            console.error(error.response.data);
        }
        res.status(500).json({ success: false, error: "Error File to IPFS" });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
