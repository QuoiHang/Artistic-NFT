import { useState, useEffect } from 'react'
import { ethers } from "ethers"
import { Row, Col, Card, Form, Button } from 'react-bootstrap'

export default function MyPurchases({ marketplace, nft, account }) {
  const [loading, setLoading] = useState(true)
  const [purchases, setPurchases] = useState([])
  const [balance, setBalance] = useState("0") // State variable for account balance

  // Function to fetch and set the balance
  const loadBalance = async () => {
    if (marketplace.provider && account) {
      const balance = await marketplace.provider.getBalance(account);
      setBalance(ethers.utils.formatEther(balance));
    }
  };

  const loadPurchasedItems = async () => {
    // Fetch purchased items from marketplace by quering Offered events with the buyer set as the user
    const filter =  marketplace.filters.Bought(null,null,null,null,null,account)
    const results = await marketplace.queryFilter(filter)
    //Fetch metadata of each nft and add that to listedItem object.
    const purchases = await Promise.all(results.map(async i => {
      // fetch arguments from each result
      i = i.args
      // get uri url from nft contract
      const uri = await nft.tokenURI(i.tokenId)
      // use uri to fetch the nft metadata stored on ipfs 
      const response = await fetch(uri)
      const metadata = await response.json()
      // get total price of item (item price + fee)
      const totalPrice = await marketplace.getTotalPrice(i.itemId)
      // define listed item object
      let purchasedItem = {
        totalPrice,
        price: i.price,
        itemId: i.itemId,
        name: metadata.name,
        description: metadata.description,
        image: metadata.image
      }
      return purchasedItem
    }))
    setLoading(false)
    setPurchases(purchases)
  }

  const resellItem = async (itemId, price) => {
    const priceInWei = ethers.utils.parseEther(price.toString());
    await marketplace.resellItem(itemId, priceInWei);
  };

  useEffect(() => {
    loadPurchasedItems()
    loadBalance()
  }, [account])

  useEffect(() => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);

    const updateBalanceOnNewBlock = async () => {
      await loadBalance();
    };

    provider.on("block", updateBalanceOnNewBlock);

    return () => {
      provider.off("block", updateBalanceOnNewBlock);
    };
  }, [account, marketplace.provider]); // Re-run when account or provider change

  if (loading) return (
    <main style={{ padding: "1rem 0" }}>
      <h2>Loading...</h2>
    </main>
  )

  return (
    <div className="flex justify-center">
      <div className="balance-info">
        {/* Displaying the balance */}
        <h3>Your Balance: {balance} ETH</h3>
      </div>

      <hr className="hr" />

      {purchases.length > 0 ?
        <div className="px-5 container">
          <Row xs={1} md={2} lg={4} className="g-4 py-5">
            {purchases.map((item, idx) => (
              <Col key={idx} className="overflow-hidden">
                <Card>
                  <Card.Img variant="top" src={item.image} />
                  <Card.Body color="secondary">
                    <Card.Title>{item.name}</Card.Title>
                    <Card.Text>{item.description}</Card.Text>
                    <Form.Control
                      size="lg"
                      required
                      type="number"
                      min="1"
                      placeholder="Price in ETH"
                      onChange={(e) => item.resellPrice = e.target.value}/>
                    <div className="d-grid px-0">
                      <Button
                        className='button-blue'
                        onClick={() => resellItem(item.itemId, item.resellPrice)}
                        variant="primary"
                        size="lg">
                        Resell NFT
                      </Button>
                    </div>
                  </Card.Body>
                  <Card.Footer>Bought at {ethers.utils.formatEther(item.totalPrice)} ETH</Card.Footer>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
        : (
          <main style={{ padding: "1rem 0" }}>
            <h2>You have not any purchase yet.</h2>
          </main>
        )}
    </div>
  );
}