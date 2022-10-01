import React, { useEffect, useState } from "react";
import { ethers } from 'ethers';

import { contractAbi, contractAddressFunc } from '../../utils/contants'

export const TransactionContext = React.createContext();

const { ethereum } = window;

const getEthereumContract = async () => {
    const provider = new ethers.providers.Web3Provider(ethereum)
    const signer = provider.getSigner()
    const { chainId } = await provider.getNetwork()
    console.log(signer.getAddress())
    const contractAddress = contractAddressFunc(chainId)
    console.log(contractAddress)
    const transactionContract = new ethers.Contract(contractAddress, contractAbi, signer)
    return transactionContract;
}




export const TransactionProvider = ({ children }) => {

    const [currentAccount, setCurrentAccount] = useState('')

    const [formData, setFormData] = useState(
        { addressTo: '', amount: '', keyword: '', message: '' }
    )

    const [transactionsRetrieved, setTransactions] = useState([])

    const [isLoading, setIsLoading] = useState(false)

    const [transactionCount, setTransactionCount] = useState(localStorage.getItem('transactionCount'))


    const handleChange = (e, name) => {
        console.log('handling change')
        console.log(e.target.value)
        setFormData((prevState) => ({ ...prevState, [name]: e.target.value }));
    }


    const getAllTransactions = async () => {
        try {
            if (!ethereum) return alert('Please install metamask')
            const transactionContract = await getEthereumContract()
            const availableTransactions = await transactionContract.getAllTransactions()

            const structuredTransactions = availableTransactions.map((transaction) => ({
                addressTo: transaction.receiver,
                addressFrom: transaction.sender,
                timestamp: new Date(transaction.timestamp.toNumber() * 1000).toLocaleString(),
                message: transaction.message,
                keyword: transaction.keyword,
                amount: parseInt(transaction.amount._hex) / (10 ** 18)
            }))
            setTransactions(structuredTransactions)
            console.log(transactionsRetrieved)
        } catch (error) {
            console.log(error)
        }
    }




    const checkIfWalletIsConnected = async () => {
        try {
            if (!ethereum) return alert('Please install metamask')

            const accounts = await ethereum.request({ method: 'eth_accounts' })
            if (accounts.length) {
                setCurrentAccount(accounts[0])

                getAllTransactions()

                //getAllTransactions
            } else {
                console.log('No accounts found')
            }
            console.log(accounts)
        } catch (error) {
            console.log(error)
            throw new Error('No ethreum object')
        }
    }


    const checkIfTransactionsExist = async () => {

        try {
            const transactionContract = await getEthereumContract()
            const transactionCount = await transactionContract.getTransactionCount()
            window.localStorage.setItem('transactionCount', transactionCount)
        } catch (error) {
            console.log(error)
            throw new Error('No ethreum object')

        }
    }

    const connectWallet = async () => {
        try {
            if (!ethereum) return alert('Please install metamask')
            const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
            setCurrentAccount(accounts[0])
        } catch (err) {
            console.log(err)
            throw new Error('No ethreum object')
        }
    }


    const sendTransaction = async () => {
        try {
            if (!ethereum) return alert('Please install metamask')
            const { addressTo, amount, keyword, message } = formData;
            const transactionContract = await getEthereumContract();
            console.log(transactionContract)
            const parseAmount = ethers.utils.parseEther(formData['amount'])
            var from = currentAccount
            var to = formData.addressTo
            var gas = '0x5208'//hex
            var value = parseAmount._hex //

            console.log(`${from} ${to} ${gas} ${value}`)

            await ethereum.request({
                method: "eth_sendTransaction",
                params: [{
                    from: currentAccount,
                    to: addressTo,
                    gas: "0x5208",
                    value: parseAmount._hex,
                }],
            });

            console.log('done')

            const tx_hash = await transactionContract.addToBlockChain(
                addressTo, parseAmount, message, keyword)

            setIsLoading(true)
            console.log(`loading ${tx_hash.hash}`)
            await tx_hash.wait();
            setIsLoading(false)
            console.log(`Success ${tx_hash.hash}`)
            const transactionCount = await transactionContract.getTransactionCount()
            setTransactionCount(transactionCount.toNumber())
            window.location.reload()
        } catch (error) {
            console.log(error)
            throw new Error('No ethreum object')
        }
    }

    const checkChain = async () => {
        const provider = new ethers.providers.Web3Provider(ethereum)
        const { chainId } = await provider.getNetwork()
        if (chainId != 80001 && chainId != 5 && chainId != 97) {

            window.ethereum.request({
                method: "wallet_addEthereumChain",
                params: [{
                    chainId: "0x89",
                    rpcUrls: ["https://rpc-mainnet.matic.network/"],
                    chainName: "Matic Mainnet",
                    nativeCurrency: {
                        name: "MATIC",
                        symbol: "MATIC",
                        decimals: 18
                    },
                    blockExplorerUrls: ["https://polygonscan.com/"]
                }]
            });

        }
    }


    useEffect(() => {
        checkChain()
        checkIfWalletIsConnected()
        checkIfTransactionsExist()
    }, [])
    return (
        <TransactionContext.Provider value={{ connectWallet, currentAccount, formData, setFormData, isLoading, transactionsRetrieved, handleChange, sendTransaction }}>
            {children}
        </TransactionContext.Provider>
    )
}