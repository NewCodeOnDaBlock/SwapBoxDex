import { React, useState, useRef, useEffect } from "react";
import './SwapBox.css';
import logo from '../images/RM (1).png'
import axios from 'axios';
import unicorn from '../images/unicorn.png'
import whitecloud from '../images//grey_whitecloud.png'
import lightpurplecloud from '../images/lightpurple_pinkcloud.png'
import moon from '../images//Moon.png'
import purplecloud from '../images/purplecloud.png'
import rocket from '../images/rocket.png'
import stars from '../images/stars.png'
import video from '../videos/UnicordBackgroundVid.mp4'


const SwapBox = ({ Moralis }) => {

    const swapBtnRef = useRef();
    const connectWalletBtnRef = useRef();
    const logoutWalletBtnRef = useRef();
    const modalBackgroundRef = useRef();
    const tokenModalRef = useRef();
    const fromTokenImgRef = useRef();
    const toTokenImgRef = useRef();
    const fromTokenTextRef = useRef();
    const toTokenTextRef = useRef();
    const gasFeeRef = useRef();
    const fromAmountRef = useRef();
    const toAmountRef = useRef();
    // const swapBtnRefNode = swapBtnRef.current;
    const [tokenlist, setTokenList] = useState();
    const [searchtokennameinput, setSearchTokeNameInput] = useState();
    const [fromamount, setFromAmount] = useState();
    const [toamount, setToAmount] = useState();
    const [currentselectside, setCurrentSelectSide] = useState();
    const [currenttrade, setCurrentTrade] = useState({});
    const [currentfromprice, setCurrentFromPrice] = useState();
    const [currenttoprice, setCurrentToPrice] = useState();
    const [disabled, setDisabled] = useState(true);
    const [currentuser, setCurrentUser] = useState();

    /*=================================================================*/

    let tokens;

    /*=================================================================*/


    const init = async () => {

        await Moralis.initPlugins();
        // await Moralis.User.enableUnsafeCurrentUser()
        // await Moralis.User.logOut();
        if (Moralis.User.current()) {
            const connectWalletBtnRefNode = connectWalletBtnRef.current;
            const logoutWalletBtnRefNode = logoutWalletBtnRef.current;
            connectWalletBtnRefNode.style.display = 'none';
            logoutWalletBtnRefNode.style.display = 'block';
            setDisabled(false)
        }
        // await Moralis.enableWeb3();
        await getListOfAllTokens();
    }

    /*=================================================================*/

    const getListOfAllTokens = async () => {
        const result = await Moralis.Plugins.oneInch.getSupportedTokens({
            chain: 'eth',
        });
        tokens = result.tokens;
        setTokenList(tokens);
        // console.log(tokens)
    }

    /*=====================================================================*/


    const login = async () => {
        const connectWalletBtnRefNode = connectWalletBtnRef.current;
        const logoutWalletBtnRefNode = logoutWalletBtnRef.current;

        setCurrentUser(Moralis.User.current());
        if (!currentuser) {
            setCurrentUser(await Moralis.authenticate({ signingMessage: "Log in using Metamask" })
                .then(function (currentUser) {
                    console.log("logged in user:", currentUser);
                    console.log(currentUser.get("ethAddress"));
                    connectWalletBtnRefNode.style.display = 'none';
                    logoutWalletBtnRefNode.style.display = 'block';
                    setDisabled(false)
                })
                .catch(function (error) {
                    console.log(error);
                }));
        }
    }

    const logout = async () => {
        await Moralis.User.logOut();

        const connectWalletBtnRefNode = connectWalletBtnRef.current;
        const logoutWalletBtnRefNode = logoutWalletBtnRef.current;

        connectWalletBtnRefNode.style.display = 'block';
        logoutWalletBtnRefNode.style.display = 'none';
        console.log("logged out");
        setDisabled(true)
    }

    /* =====================================================================*/

    const openModal = (side) => {
        const modalBackgroundRefNode = modalBackgroundRef.current;
        const tokenModalRefNode = tokenModalRef.current;

        setCurrentSelectSide(side);
        modalBackgroundRefNode.style.display = 'block';
        tokenModalRefNode.style.display = 'block'
    }
    function closeModal() {
        const modalBackgroundRefNode = modalBackgroundRef.current;
        const tokenModalRefNode = tokenModalRef.current;

        modalBackgroundRefNode.style.display = 'none';
        tokenModalRefNode.style.display = 'none'
    }

    /* =====================================================================*/

    const searchTokenInput = (e) => {
        setSearchTokeNameInput(e.target.value)
        console.log(searchtokennameinput)
    }

    const selectToken = (address) => {
        closeModal();
        getQuote();
        setCurrentTrade({ ...currenttrade, [currentselectside]: tokenlist[address] });
    }

    useEffect(() => {
        renderSelectInterface();
        // console.log(currenttrade['from']?.name);

    }, [currenttrade])

    /* =====================================================================*/

    const renderSelectInterface = () => {
        const fromTokenImgRefNode = fromTokenImgRef.current;
        const fromTokenTextRefNode = fromTokenTextRef.current;
        const toTokenImgRefNode = toTokenImgRef.current;
        const toTokenTextRefNode = toTokenTextRef.current;

        if (currenttrade.from) {

            fromTokenImgRefNode.style.display = 'block';
            fromTokenImgRefNode.src = currenttrade.from.logoURI;
            fromTokenTextRefNode.innerHTML = currenttrade.from.symbol;
        }
        if (currenttrade.to) {

            toTokenImgRefNode.style.display = 'block';
            toTokenImgRefNode.src = currenttrade.to.logoURI;
            toTokenTextRefNode.innerHTML = currenttrade.to.symbol;
        }
    }

    /* =====================================================================*/

    const fromAmountInput = (e) => {
        setFromAmount(e.target.value);
    }

    const toAmountInput = (e) => {
        setToAmount(e.target.value);
    }

    useEffect(() => {
        getQuote();

        axios.get(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${currenttrade.from?.name.toLowerCase()}&order=market_cap_desc&per_page=100&page=1&sparkline=false`)
            .then(response => {
                setCurrentFromPrice(response.data);
                // console.log(currentfromprice)
            })
            .catch(error => console.log('failed', error))


        axios.get(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${currenttrade.to?.name.toLowerCase()}&order=market_cap_desc&per_page=100&page=1&sparkline=false`)
            .then(response => {
                setCurrentToPrice(response.data);
                console.log(currenttoprice)
            })
            .catch(error => console.log('failed', error))

    }, [fromamount, toamount, currenttrade])


    const getQuote = async () => {
        const gasFeeRefNode = gasFeeRef.current;
        const toAmountRefNode = toAmountRef.current;

        if (!currenttrade.from || !currenttrade.to || !fromamount) return;

        let amount = fromAmountRef.current.value * 10 ** currenttrade.from.decimals;


        const quote = await Moralis.Plugins.oneInch.quote({
            chain: "eth", // The blockchain you want to use (eth/bsc/polygon)
            fromTokenAddress: currenttrade.from.address, // The token you want to swap
            toTokenAddress: currenttrade.to.address, // The token you want to receive
            amount: Number(amount)
        });
        // console.log(quote)
        gasFeeRefNode.innerText = `${quote?.estimatedGas} Gwei`;
        toAmountRefNode.value = quote?.toTokenAmount / 10 ** quote['toToken']?.decimals;
    }


    /* =====================================================================*/

    const attemptSwap = async (e) => {
        e.preventDefault();

        let address = Moralis.User.current().get("ethAddress");
        let amount = fromAmountRef.current.value * 10 ** currenttrade.from.decimals;

        if (currenttrade.from.symbol !== "ETH") {
            const allowance = await Moralis.Plugins.oneInch.hasAllowance({
                chain: "eth", // The blockchain you want to use (eth/bsc/polygon)
                fromTokenAddress: currenttrade.from.address, // The token you want to swap
                fromAddress: address, // Your wallet address
                amount: Number(amount),
            });
            // console.log(allowance);
            if (!allowance) {
                await Moralis.Plugins.oneInch.approve({
                    chain: "eth", // The blockchain you want to use (eth/bsc/polygon)
                    tokenAddress: currenttrade.from.address, // The token you want to swap
                    fromAddress: address, // Your wallet address
                });
            }
        }
        try {
            swapBtnRef.current.innerHTML = 'Swapping...'
            let receipt = await executeSwap(address, amount);
            alert("Swap Complete");
            swapBtnRef.current.innerHTML = 'Swap'
            
        } catch (error) {
            swapBtnRef.current.innerHTML = 'Swap'
            console.log(error);
        }
    }


    const executeSwap = (userAddress, amount) => {

        return Moralis.Plugins.oneInch.swap({
            chain: "eth", // The blockchain you want to use (eth/bsc/polygon)
            fromTokenAddress: currenttrade.from.address, // The token you want to swap
            toTokenAddress: currenttrade.to.address, // The token you want to receive
            amount: amount,
            fromAddress: userAddress, // Your wallet address
            slippage: 1,
        });
    }



    init();


    return (

        <div id="swap-box-body">

            <video autoPlay loop muted id="video" >
                <source src={(video)} type="video/mp4" />
            </video>


            <div id="nav-container">
                <div id="logo-title-container">
                    <img src={(logo)} alt="logo" className="logo" />
                    <h3>The SwapBox Exchange</h3>
                </div>
                <div id="menu-title-container">
                    <button id="login-btn" onClick={login} ref={connectWalletBtnRef}>Connect Wallet</button>
                    <button id="logOut-btn" onClick={logout} ref={logoutWalletBtnRef}>Disconnect Wallet</button>
                </div>
            </div>


            <div id="dex-container">
                <div id="dex-top-header-container">
                    <h3>The SwapBox</h3>
                    <p><em>Lighting speed swap</em></p>
                </div>


                <div className="swapbox">
                    <div className="swapbox-left">
                        <label style={{ color: 'white', fontSize: '12px' }}>From:</label>
                        <div className="swapbox_select">
                            <input onChange={fromAmountInput} value={fromamount} ref={fromAmountRef} type="number" placeholder="0.0" id="from_amount" className="amount-input-box" />
                        </div>
                        {
                            fromamount ?

                                <p style={{ color: 'white', fontSize: '13px' }}><em>{"~ $" + currentfromprice[0]?.current_price * fromamount}</em></p>

                                : <p style={{ color: 'white', fontSize: '10px' }}></p>
                        }
                    </div>
                    <div className="swapbox-right">
                        <div onClick={(e) => openModal("from")} className="swapbox_select token_select" id="from_token_select">
                            <img className="token_image" id="from_token_img" ref={fromTokenImgRef} alt="token-logo" />
                            <span id="from_token_text" ref={fromTokenTextRef}>Select Token</span>
                        </div>
                    </div>
                </div>


                <div className="swapbox">
                    <div className="swapbox-left">
                        <label style={{ color: 'white', fontSize: '12px' }}>To:</label>
                        <div className="swapbox_select">
                            {

                                fromamount ?

                                    <input placeholder="Calculating..." style={{ fontSize: '13px' }} onChange={toAmountInput} ref={toAmountRef} value={toamount} type="number" id="to_amount" className="amount-input-box" />
                                    :
                                    <input onChange={toAmountInput} style={{ fontSize: '13px' }} ref={toAmountRef} value={toamount} type="number" placeholder="Select tokens first..." id="to_amount" className="amount-input-box" />
                            }
                        </div>
                        {
                            fromamount ?

                                <p style={{ color: 'white', fontSize: '13px' }}><em>{"~ $" + currenttoprice[0]?.current_price}</em></p>

                                : ''

                        }
                        {
                            currenttoprice === 'undefined' ?

                                <p style={{ color: 'white', fontSize: '10px' }}>Data Unavailable...</p>

                                : ''
                        }

                    </div>
                    <div className="swapbox-right">
                        <div onClick={(e) => openModal("to")} className="swapbox_select token_select" id="to_token_select">
                            <img className="token_image" id="to_token_img" ref={toTokenImgRef} alt="token-logo" />
                            <span id="to_token_text" ref={toTokenTextRef}>Select Token</span>
                        </div>
                    </div>
                </div>


                <div className="gas-estimate-title">
                    ETH Gas Fee:
                    <span id="gas_estimate" ref={gasFeeRef}></span>
                </div>

                <div id="swapbtn-container">
                    <form>
                        <button disabled={disabled} onClick={attemptSwap} id="swap_button" ref={swapBtnRef}>Swap</button>
                    </form>
                </div>
            </div>

            <div className="modal-background" ref={modalBackgroundRef} onClick={closeModal}></div>
            <div id="modal-container" ref={tokenModalRef}>
                <div id="modal-header-container">
                    <div id="modal-header-left">
                        <p>Select a token</p>
                    </div>
                    <input onChange={searchTokenInput} placeholder="Search by name only..." value={searchtokennameinput} />
                    <div id="modal-header-right">
                        <div id="close-modal" onClick={closeModal}>X</div>
                    </div>
                </div>
                <div id="token-list">
                    {
                        searchtokennameinput ?
                            Object.keys(tokenlist).filter(token => (
                                tokenlist[token].name.includes(searchtokennameinput)
                            )).map(token => (
                                <div id="token-option-container" onClick={() => selectToken(tokenlist[token].address)} value={token}>
                                    <div id="token-option-container-left">
                                        <img src={tokenlist[token].logoURI} id="token-option-logo" alt="" />
                                    </div>
                                    <div id="token-option-container-right">
                                        <p id="token-option-symbol">{tokenlist[token].symbol}</p>
                                        <p id="token-option-name">{tokenlist[token].name}</p>
                                    </div>
                                </div>
                            ))

                            :
                            tokenlist ?
                                Object.keys(tokenlist).map(token => (
                                    <div id="token-option-container" onClick={() => selectToken(tokenlist[token].address)} value={token}>
                                        <div id="token-option-container-left">
                                            <img src={tokenlist[token].logoURI} id="token-option-logo" alt="" />
                                        </div>
                                        <div id="token-option-container-right">
                                            <p id="token-option-symbol">{tokenlist[token].symbol}</p>
                                            <p id="token-option-name">{tokenlist[token].name}</p>
                                        </div>
                                    </div>
                                ))
                                : ''
                    }

                </div>
            </div>

            {/* <div id="backgroundImg-container">
                <img src={(unicorn)} id="unicorn" alt="" />
                <img src={(whitecloud)} id="whitecloud" alt="" />
                <img src={(whitecloud)} id="whitecloud2" alt="" />
                <img src={(lightpurplecloud)} id="lightpurplecloud" alt="" />
                <img src={(moon)} id="moon" alt="" />
                <img src={(purplecloud)} id="purplecloud" alt="" />
                <img src={(rocket)} id="rocket" alt="" />
                <img src={(stars)} id="stars" alt="" />
            </div> */}




        </div>
    )
}
export default SwapBox;