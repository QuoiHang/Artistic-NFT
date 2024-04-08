import axios from 'axios'; // Upload/ download files from IPFS
import { useState } from 'react'
import { ethers } from "ethers"
import { Row, Form, Button } from 'react-bootstrap'

const Create = ({ marketplace, nft }) => {
  // Assign current state and a setter
  const [fileImg, setFile] = useState(null);

  const [name, setName] = useState("")
  const [desc, setDescription] = useState("")
  const [price, setPrice] = useState("")

  // Assume it is the IPFS for storing all NFTs
  const REACT_APP_PINATA_API_KEY="ed269603055a4337e099"
  const REACT_APP_PINATA_SECRET_API_KEY="fad0b854d1e45936b725415469d0410d1d3c08ec8d283e828e1690fb24ee4801"

  const sendJSONtoIPFS = async (ImgHash) => {

    try {
      console.log("Processing Json");
      // Create a Blob from your JSON data
      const jsonBlob = new Blob([JSON.stringify({
        name: name,
        description: desc,
        image: ImgHash
      })], { type: 'application/json' });

      // Create FormData and append the Blob as a file
      // formData.append(fieldName, file, fileName);
      const formData = new FormData();
      formData.append("file", jsonBlob, `${name}.json`);

      // Use the pinFileToIPFS endpoint
      const resFile = await axios({
        method: "post",
        url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
        data: formData,
        headers: {
          'pinata_api_key': REACT_APP_PINATA_API_KEY,
          'pinata_secret_api_key': REACT_APP_PINATA_SECRET_API_KEY,
          "Content-Type": "multipart/form-data"
        },
      });

      const tokenURI = `https://gateway.pinata.cloud/ipfs/${resFile.data.IpfsHash}`;
      console.log("Token URI", tokenURI);
      mintThenList(tokenURI)

    } catch (error) {
      console.log("JSON to IPFS: ")
      console.log(error);
    }
  }

  const sendFileToIPFS = async (e) => {

    e.preventDefault();
    console.log("Sending File To IPFS");
    console.log(e);

    if (fileImg) {
      try {
        console.log("Processing File");
        const formData = new FormData();
        formData.append("file", fileImg);
        console.log(formData)

        const resFile = await axios({
          method: "post",
          url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
          data: formData,
          headers: {
            'pinata_api_key': REACT_APP_PINATA_API_KEY,
            'pinata_secret_api_key': REACT_APP_PINATA_SECRET_API_KEY,
            "Content-Type": "multipart/form-data"
          },
        });

        const ImgHash = `https://gateway.pinata.cloud/ipfs/${resFile.data.IpfsHash}`;
        console.log(ImgHash);
        sendJSONtoIPFS(ImgHash)

      } catch (error) {
        console.log("File to IPFS: ")
        console.log(error)
      }
    }
  }

  const mintThenList = async (uri) => {
    // mint nft 
    await (await nft.mint(uri)).wait()
    // get tokenId of new nft 
    const id = await nft.tokenCount()
    // approve marketplace to spend nft
    await (await nft.setApprovalForAll(marketplace.address, true)).wait()
    // add nft to marketplace
    const listingPrice = ethers.utils.parseEther(price.toString())
    await (await marketplace.makeItem(nft.address, id, listingPrice)).wait()
  }
  return (

    <div className="container-fluid mt-5">
      <div className="row">
        <main role="main" className="col-lg-12 mx-auto" style={{ maxWidth: '1000px' }}>
          <div className="content mx-auto">
            <Row className="g-4">
              <Form.Control onChange={(e) => setFile(e.target.files[0])} size="lg" required type="file" name="file" />
              <Form.Control onChange={(e) => setName(e.target.value)} size="lg" required type="text" placeholder="Name" />
              <Form.Control onChange={(e) => setDescription(e.target.value)} size="lg" required as="textarea" placeholder="Description" />
              <Form.Control onChange={(e) => setPrice(e.target.value)} size="lg" required type="number" min="1" placeholder="Price in ETH" />
              <div className="d-grid px-0">
                <Button className='button-blue' onClick={sendFileToIPFS} variant="primary" size="lg">
                  Mint NFT in Udem Marketplace!
                </Button>
              </div>
            </Row>
          </div>
        </main>
      </div>
    </div>

    )
}

export default Create