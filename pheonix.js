
import Web3 from 'web3';
import FS from 'fs';
import { strict as assert } from 'assert';
import contract from './Pheonix.json' assert {type: 'json'};
import Sequalize from 'sequelize';

const connection= new Sequalize('pheonix', 'root', '', {
    host: '127.0.0.1',
    port: '3306',
    dialect: 'mysql'
});


let rawAbi = FS.readFileSync('Pheonix-abi.json');
const web3 = new Web3('wss://ropsten.infura.io/ws/v3/9528b48e97f94050824a74c062cd7c82');
const ABI = contract.abi;
const contract_address = '0x36062E55AD5B003bD94928CDBFD39053F12C6cDe';
const myContract = await new web3.eth.Contract(ABI, contract_address);

let options ={
    address: ['0x36062E55AD5B003bD94928CDBFD39053F12C6cDe'],
    filter: {
        value: [],
    },
    fromBlock: 0
};

const Store = connection.define('Stores',{
    storesId: Sequalize.DataTypes.INTEGER,
    name: Sequalize.DataTypes.TEXT,
    description: Sequalize.DataTypes.TEXT
});
connection.sync();
myContract.events.AddStore(options, function(error, result){
    const store = Store.build({
        id: result.returnValues.storesId,
        name: result.returnValues.storeName,
        description: result.returnValues.storeDescription
    })
    store.save();
})
    .on('data', transaction => {
        console.log(transaction.returnValues);
    })
    .on('changed', changed => console.log(changed))
    .on('error', err => {throw err})
    .on('connected', str => console.log(str))

connection.sync();

