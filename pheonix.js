
import Web3 from 'web3';
import FS from 'fs';
import { strict as assert } from 'assert';
import contract from './Pheonix.json' assert {type: 'json'};
import Sequalize from 'sequelize';

const connection= new Sequalize('pheonix', 'root', 'Dreghiciuanca1', {
    host: '127.0.0.1',
    port: '3306',
    dialect: 'mysql'
});

const AddStoreEventType = 'AddStore';
const PaymentEventType = 'Payment';
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

const Stores = connection.define('Stores',{
    storesId: {
        type: Sequalize.DataTypes.INTEGER,
        primaryKey: true
    },
    name: Sequalize.DataTypes.TEXT,
    description: Sequalize.DataTypes.TEXT
},{
    timestamps: false
});

const Payments = connection.define('Payments', {
    txId: {
        type: Sequalize.DataTypes.INTEGER,
        primaryKey: true
    },
    sender: {
        type: Sequalize.DataTypes.TEXT,
        key: 'sender'
    },
    receiver: {
        type: Sequalize.DataTypes.TEXT,
        key: 'receiver'
    },
    amount: Sequalize.DataTypes.INTEGER,
    storeId: {
        type: Sequalize.DataTypes.INTEGER,
        key: 'storeId'
    },
    productId: Sequalize.DataTypes.TEXT

},{
    timestamps: false
});

myContract.events.allEvents(options).on('data', (e)=>{
    console.log(e.event);
    if(e.event === AddStoreEventType){
        // const store = Stores.build({
        //     storesId: parseInt(e.returnValues.storeId),
        //     name: e.returnValues.storeName,
        //     description: e.returnValues.storeDescription
        // })
        // store.save();
        console.log("Wallet: "+e.returnValues.wallet);
        console.log("StoreID: "+e.returnValues.storeId);
        console.log("StoreName: "+e.returnValues.storeName);
        console.log("StoreDescription: "+e.returnValues.storeDescription);

    }else if(e.event === PaymentEventType ) {
        const payment = Payments.build({
            txId: parseInt(e.returnValues.txId),
            sender: e.returnValues.sender,
            receiver: e.returnValues.receiver,
            amount: parseInt(e.returnValues.amount),
            storeId: parseInt(e.returnValues.storeId),
            productId: e.returnValues.productId
        })
        payment.save();
        console.log("Sender: "+ e.returnValues.sender);
        console.log("Receiver: "+ e.returnValues.receiver);
        console.log("Amount: "+ e.returnValues.amount);
        console.log("StoreId: "+ e.returnValues.storeId);
        console.log("ProductId: "+ e.returnValues.productId);
    }
});
connection.sync();

