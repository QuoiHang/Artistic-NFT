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

  const sendFileToIPFS = async (e) => {
    e.preventDefault();
    if (fileImg) {
      try {
        console.log("Sending File To IPFS");
        const formData = new FormData();
        formData.append("file", fileImg);
        formData.append("name", name);
        formData.append("description", desc);

        const res = await axios.post("http://localhost:3001/upload", formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            },
        });

        const { tokenURI } = res.data;
        console.log("Token URI", tokenURI);
        mintThenList(tokenURI);
        
      } catch (error) {
        console.log("Error uploading file", error);
      }
    }
  };
  
  const mintThenList = async (uri) => {
    //console.log("URI:", uri);
    //console.log("Price:", price);

    try{
      // mint nft 
      const mintTx = await nft.mint(uri);
      await mintTx.wait();
      console.log("NFT Minted");

      // get tokenId of new nft 
      const tokenId = await nft.tokenCount();
      console.log("Token ID", tokenId.toString());

      // approve marketplace to spend nft
      await (await nft.setApprovalForAll(marketplace.address, true)).wait();
      console.log("Marketplace approved");

      // add nft to marketplace
      const listingPrice = ethers.utils.parseEther(price.toString());
      const listingTx = await marketplace.makeItem(nft.address, tokenId, listingPrice);
      await listingTx.wait();
      console.log("NFT Listed on Marketplace");
    } catch (error) {
      console.error("Error in mintThenList:", error.message);
    }
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