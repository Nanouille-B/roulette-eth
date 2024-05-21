import React, { useState, useEffect } from 'react';
import Web3, { Numbers } from 'web3';
import './NumberRoulette.css';
import RouletteContract from '../contrat_hardhat/artifacts/contracts/RouletteContract.sol/RouletteContract.json'; // Import the JSON file containing the ABI and bytecode
import { RegisteredSubscription } from 'web3-eth';

declare global {
    interface Window {
        ethereum?: any;
        web3?: any;
    }
}

let web3: Web3<RegisteredSubscription>;
if (window.ethereum) {
    web3 = new Web3(window.ethereum);
} else if (window.web3) {
    web3 = new Web3(window.web3.currentProvider);
} else {
    console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
}

const numbers = Array.from({ length: 8 }, (_, i) => i);
const colors = numbers.map(n => (n % 2 === 0 ? 'black' : 'red'));

const NumberRoulette: React.FC = () => {
    const [spinning, setSpinning] = useState(false); // is the wheel spinning?
    const [rotation, setRotation] = useState(0); // current rotation of the wheel
    const [betAmount, setBetAmount] = useState(''); // amount of the bet
    const [winColor, setWinColor] = useState(0); // winning number
    const [result, setResult] = useState(''); // result of the spin
    const [showResult, setShowResult] = useState(false); // show the result
    const [account, setAccount] = useState(''); // current account

    const contractAddress = '0x5bC22E8e2E756017409f434e422238B9bf8d2A42'; // Replace with your deployed contract address
    const contract = new web3.eth.Contract(RouletteContract.abi, contractAddress);
    
    useEffect(() => {
        // Request account access if needed
        if (window.ethereum) {
          window.ethereum.request({ method: 'eth_requestAccounts' })
            .then((accounts: React.SetStateAction<string>[]) => {
              setAccount(accounts[0]);
            })
            .catch((err: any) => console.log(err));
        }
      }, []);

    const spin = () => {
        setSpinning(true);
        setRotation(getRotationForWinningNumber());

        setTimeout(() => {
            setSpinning(false);
            setShowResult(true);
        }, 2000); // Changed to 2 seconds for the wheel to stop spinning
    };

    const getColorNumber = (color: string) => {
        return color === 'black' ? 0 : 1;
    }

    const handleBet = async (color: string) => {
        if (!spinning) {
            try {
                const betColor = getColorNumber(color);
                setShowResult(false);

                // Setting up the event listener before sending the transaction
                contract.events.SpinResult({ filter: { player: account } })
                .on('data', event => {
                    const { player, won, payout, balance } = event.returnValues; 
                    if (won === true) {
                        setWinColor(betColor);
                        setResult(`Congratulations! You won ${web3.utils.fromWei(payout as Numbers, 'ether')} ETH.`);
                    } else {
                        setWinColor(1 - betColor);
                        setResult('Sorry, you lost.');
                    }

                    spin();
                });

                // Send the transaction
                await contract.methods.spinWheel(betColor).send({
                    from: account,
                    value: web3.utils.toWei(betAmount, 'ether'),
                    gas: '200000',
                    gasPrice: (await web3.eth.getGasPrice()).toString(),
                });
        
            } catch (error) {
              console.error('Error:', error);
              setResult('Transaction failed.');
            }
        }
      };

      const getRotationForWinningNumber = () => {
        if (result !== null) {
            // Calculate random spins to simulate spinning
            const randomSpins = Math.floor(Math.random() * 30 + 10) * 360;
            // Calculate the rotation angle for the winning number
            const winningRotation = (360 / numbers.length) * (2*Math.floor(Math.random()*numbers.length/2) + winColor);
            // Calculate the total rotation to align the winning number at the top
            const totalRotation = randomSpins + winningRotation;
            // Offset by half a slot to center the winning number
            return totalRotation - ((360 / numbers.length) / 2);
        }
        // If result is not yet available, return the current rotation
        return rotation;
    };
    

    return (
        <div className="roulette-container">
            <h1>Number Roulette</h1>
            {/* Arrow */}
            <div className="arrow-container">
                <div className="arrow"></div>
            </div>
            <div className="wheel-container">
                <div
                    className={`wheel ${spinning ? 'spinning' : ''}`}
                    style={{
                        transform: `rotate(${getRotationForWinningNumber()}deg)`, // Use the calculated rotation for the wheel
                        transitionDuration: spinning ? '2s' : '0s' // Set transition duration to 2s when spinning, 0s otherwise
                    }}
                >
                {numbers.map((number, index) => (
                    <div
                        key={index}
                        className={`slot ${colors[index]}`}
                        style={{ transform: `rotate(${(360 / numbers.length) * index}deg)` }}
                    >
                        <div className="inner-slot">
                        <div className="number">{number}</div>
                        </div>
                    </div>
                ))}
                </div>
            </div>
            <div className="bet-buttons">
                <input
                    type="number"
                    placeholder="Enter bet amount in ETH"
                    value={betAmount}
                    onChange={e => setBetAmount(e.target.value)}
                    onKeyPress={(event) => {
                        if (!/[0-9]|\,/.test(event.key)) {
                            event.preventDefault();
                        }
                    }}
                ></input>
                <button onClick={() => handleBet('red')} disabled={spinning}>
                    Bet on Red
                </button>
                <button onClick={() => handleBet('black')} disabled={spinning}>
                    Bet on Black
                </button>
                {(result === null || !showResult) ? (
                    <p>Result not drawn yet</p>
                ) : (
                    <p>
                        {result} <br />
                    </p>
                )}
            </div>
        </div>
    );
};

export default NumberRoulette;
