import { useState, useEffect } from 'react'
import { ethers } from "ethers"
import { Row, Col, Card } from 'react-bootstrap'

function renderSoldArtifacts(items) {
  return (
    <>
      <h2>Sold</h2>
      <Row xs={1} md={2} lg={4} className="g-4 py-3">
        {items.map((item, idx) => (
          <Col key={idx} className="overflow-hidden">
            <Card>
              <Card.Img variant="top" src={item.image} />
              <Card.Footer>
                Sold at {ethers.utils.formatEther(item.totalPrice)} ETH <br/> Recieved {ethers.utils.formatEther(item.price)} ETH
              </Card.Footer>
            </Card>
          </Col>
        ))}
      </Row>
    </>
  )
}

export default function MyListedArtifacts({ marketplace, nft, account }) {
  const [loading, setLoading] = useState(true)
  const [listedArtifacts, setListedArtifacts] = useState([])
  const [soldArtifacts, setSoldArtifacts] = useState([])
  const loadListedArtifacts = async () => {
    // Load all sold artifacts that the user listed
    const itemCount = await marketplace.itemCount()
    let listedArtifacts = []
    let soldArtifacts = []
    for (let indx = 1; indx <= itemCount; indx++) {
      const i = await marketplace.items(indx)
      if (i.seller.toLowerCase() === account) {
        // get uri url from nft contract
        const uri = await nft.tokenURI(i.tokenId)
        // use uri to fetch the nft metadata stored on ipfs 
        const response = await fetch(uri)
        const metadata = await response.json()
        // get total price of artifact (item price + fee)
        const totalPrice = await marketplace.getTotalPrice(i.itemId)
        // define listed artifact object
        let item = {
          totalPrice,
          price: i.price,
          itemId: i.itemId,
          name: metadata.name,
          description: metadata.description,
          image: metadata.image
        }
        listedArtifacts.push(item)
        // Add listed artifact to sold artifacts array if sold
        if (i.sold) soldArtifacts.push(item)
      }
    }
    setLoading(false)
    setListedArtifacts(listedArtifacts)
    setSoldArtifacts(soldArtifacts)
  }
  useEffect(() => {
    loadListedArtifacts()
  }, [])
  if (loading) return (
    <main style={{ padding: "1rem 0" }}>
      <h2>Loading...</h2>
    </main>
  )
  return (
    <div className="flex justify-center">
      {listedArtifacts.length > 0 ?
        <div className="px-5 py-3 container">
            <h2>Minted</h2>
          <Row xs={1} md={2} lg={4} className="g-4 py-3">
            {listedArtifacts.map((item, idx) => (
              <Col key={idx} className="overflow-hidden">
                <Card>
                  <Card.Img variant="top" src={item.image} />
                  <Card.Footer>{ethers.utils.formatEther(item.totalPrice)} ETH</Card.Footer>
                </Card>
              </Col>
            ))}
          </Row>
            {soldArtifacts.length > 0 && renderSoldArtifacts(soldArtifacts)}
        </div>
        : (
          <main style={{ padding: "1rem 0" }}>
            <h2>Have not minted any NFT yet</h2>
          </main>
        )}
    </div>
  );
}