import { useState, useEffect, useCallback } from 'react'
import { ethers } from "ethers"
import { Row, Col, Card, Button } from 'react-bootstrap'

const Home = ({ marketplace, nft, account }) => {
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState([])
  const [balance, setBalance] = useState("0") // State variable for account balance

  // Function to fetch and set the balance
  const loadBalance = useCallback(async () => {
    if (marketplace.provider && account) {
      const balance = await marketplace.provider.getBalance(account);
      //console.log(`Fetched balance for account ${account}:`, ethers.utils.formatEther(balance));
      setBalance(ethers.utils.formatEther(balance));
    }
  }, [marketplace.provider, account]); // Dependencies for which the function should re-run
  
  const loadMarketplaceItems = useCallback(async () => {
    setLoading(true);
    
    try{
      // Load all unsold items
      const itemCount = await marketplace.itemCount()
      let items = []
      for (let i = 1; i <= itemCount; i++) {
        const item = await marketplace.items(i)

        // get uri url from nft contract
        const uri = await nft.tokenURI(item.tokenId)
        // use uri to fetch the nft metadata stored on ipfs 
        const response = await fetch(uri)
        const metadata = await response.json()
        // get total price of item (item price + fee)
        const totalPrice = await marketplace.getTotalPrice(item.itemId)
        
        // Add item to items array
        items.push({
          totalPrice,
          itemId: item.itemId,
          seller: item.seller,
          name: metadata.name,
          description: metadata.description,
          image: metadata.image,
          sold: item.sold
        })
      }
      setItems(items)
    } catch (error) {
      console.error("Failed to load marketplace:", error);
    } finally {
      setLoading(false);  // Reset loading state after operation completes
    }
  }, [marketplace, nft]);

  const buyMarketItem = useCallback(async (item) => {
    console.log('Buying Market item:', item);
    await (await marketplace.purchaseItem(item.itemId, { value: item.totalPrice })).wait()
    loadMarketplaceItems()
    console.log('Latest Market item:', item);
  }, [marketplace]);

  /*
  const fetchItemSaleHistory = useCallback(async (itemId) => {
    // Fetch item's purchase history from the marketplace
    const filter = marketplace.filters.Bought(itemId, null, null, null, null, null)
    const results = await marketplace.queryFilter(filter)
    // Process results to extract only price and associated block number
    const priceHistory = [];
    for (const event of results) {
        const block = await marketplace.provider.getBlock(event.blockNumber);
        priceHistory.push({
            price: event.args.price.toString(), // Convert BigNumber to string if needed
            date: new Date(block.timestamp * 1000) // Convert Unix timestamp to Date object
        });
    }
    return priceHistory;
  }, [marketplace]);
  */

  useEffect(() => {
    loadMarketplaceItems();
    loadBalance();
  }, [loadMarketplaceItems, loadBalance])

  useEffect(() => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);

    const updateBalanceOnNewBlock = async () => {
      await loadBalance();
    };

    provider.on("block", updateBalanceOnNewBlock);

    return () => {
      provider.off("block", updateBalanceOnNewBlock);
    };
  }, [account, marketplace.provider, loadBalance]); // Re-run when account or provider change

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

      {items.length > 0 ? (
        <div className="px-5 container">
          <h2>Marketplace</h2>
          {/* Display unsold items */}
            {items.filter(item => !item.sold).length > 0 ? (
              <Row xs={1} md={2} lg={4} className="g-4 py-5">
              {items.filter(item => !item.sold).map((item, idx) => (
                <Col key={idx} className="overflow-hidden">
                  <Card>
                    <Card.Img variant="top" src={item.image} />
                    <Card.Body color="secondary">
                      <Card.Title>{item.name}</Card.Title>
                      <Card.Text>
                        {item.description}
                      </Card.Text>
                    </Card.Body>
                    <Card.Footer>
                      <div className='d-grid'>
                        <Button className='button-blue' onClick={() => buyMarketItem(item)} variant="primary" size="lg">
                          Buy for {ethers.utils.formatEther(item.totalPrice)} ETH
                        </Button>
                      </div>
                    </Card.Footer>
                  </Card>
                </Col>))}
             </Row>) : (
                <h4><br/>No available NFT in the Marketplace. <br/> Come back later :)</h4>
              )}
          
          <hr className="hr" />
          <h2>NFTs in History</h2>
          {/* Display all items */}
          
          {/* TODO: show all items in history */}

          <Row xs={1} md={2} lg={4} className="g-4 py-5">
            {items.map((item, idx) => (
              <Col key={idx} className="overflow-hidden">
                <Card>
                  <Card.Img variant="top" src={item.image} />
                  <Card.Body color="secondary">
                    <Card.Title>{item.name}</Card.Title>
                    <Card.Text>
                      {item.description}
                    </Card.Text>
                  </Card.Body>
                  <Card.Footer>
                    {item.sold ? (
                      <Card.Text>Lastly sold at {ethers.utils.formatEther(item.totalPrice)} ETH</Card.Text>
                    ) : (
                      <div className='d-grid'>
                        <Button className='button-blue' onClick={() => buyMarketItem(item)} variant="primary" size="lg">
                          Buy for {ethers.utils.formatEther(item.totalPrice)} ETH
                        </Button>
                      </div>
                    )}
                  </Card.Footer>
                </Card>
              </Col>
            ))}
          </Row>
        </div>)
        : (
          <main style={{ padding: "3em 0" }}>
            <h2>No NFTs have been minted yet.</h2>
            <h2>Come back later :)</h2>
          </main>
        )}
    </div>
  );
}

export default Home