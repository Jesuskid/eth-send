import abi from './Transactions.json'

export const contractAddress = '0xDbaa56A40b6198dBB0F3Da160cF884A6b2b6c56F'

export const contractAddressFunc = (chain_id) => {
    if (chain_id == 3) {
        return '0xDbaa56A40b6198dBB0F3Da160cF884A6b2b6c56F'
    } else if (chain_id == 5) {
        return '0xdFE75d2b85615d55201a33249D726788518E9070'
    } else if (chain_id == 11155111) {
        return ''
    } else if (chain_id == 97) {
        return '0x0dfC56da210b8ec20785d55F0670E45009e1EbE6'
    } else if (chain_id == 43114) {
        return ''
    } else if (chain_id == 80001) {
        return '0xDbaa56A40b6198dBB0F3Da160cF884A6b2b6c56F'
    }
}

export const contractAbi = abi['abi']