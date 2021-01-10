import React, { Component } from 'react'; 
import './App.css'; 

import Web3 from 'web3'; 
var web3;
// the old one - 0x2419bB4003E2dAA02512c5F3858E700598F9e945
const contractAddress = '0xd9145CCE52D386f254917e481eB44e9943F39138';

const abi = [
  {
    "constant": false,
    "inputs": [
      {
        "internalType": "uint256",
        "name": "etherBorrow",
        "type": "uint256"
      },
      {
        "internalType": "uint8",
        "name": "payBackDate",
        "type": "uint8"
      },
      {
        "internalType": "uint8",
        "name": "etherInterest",
        "type": "uint8"
      }
    ],
    "name": "requestLoan",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "internalType": "uint256",
        "name": "index",
        "type": "uint256"
      },
      {
        "internalType": "uint8",
        "name": "guaranteeInterest",
        "type": "uint8"
      }
    ],
    "name": "provideGuarantee",
    "outputs": [],
    "payable": true,
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "internalType": "uint256",
        "name": "index",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "isGuaranteeProvided",
        "type": "bool"
      }
    ],
    "name": "handleGuarantee",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "internalType": "uint256",
        "name": "index",
        "type": "uint256"
      }
    ],
    "name": "getLoansInfo",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      },
      {
        "internalType": "address payable",
        "name": "",
        "type": "address"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "internalType": "uint256",
        "name": "index",
        "type": "uint256"
      }
    ],
    "name": "provideLoanForLoanee",
    "outputs": [],
    "payable": true,
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "internalType": "uint256",
        "name": "index",
        "type": "uint256"
      }
    ],
    "name": "isBorrowerTransferEtherAtTime",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "internalType": "uint256",
        "name": "index",
        "type": "uint256"
      }
    ],
    "name": "getLoanState",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "internalType": "uint256",
        "name": "index",
        "type": "uint256"
      }
    ],
    "name": "payBackLoan",
    "outputs": [],
    "payable": true,
    "stateMutability": "payable",
    "type": "function"
  }
];

function setupWeb3() {
  //https://stackoverflow.com/cuestions/48735118/usin-~web3-from.metamask-in~react
  // Modern DApp Browsers
  if (window.ethereum) {
    web3 = new Web3(window.ethereum);
    try {
      window.ethereum.enable().then(function() {
        // User has allowed account access to DApp...
        
      });
    } catch (c) {
      // User has denied account access to DApp...
      alert(c);
    }
  } else if (window.web3) {
    // Legacy DApp Browsers
    web3 = new Web3(window.web3.currentProvider);
  } else {
    // Non—DApp Browsers
    alert("You have to install MetaMask !");
  }
}

class App extends Component 
{
  // state object for storing current data
  state = {
    _isRendered: false,
    currentAccount: '',
    borrower: '',
    guarantor: '',
    lender: '',
    value: "",
    selectedOption: ''
  };

  // variable for contract and for storing etherAmount with which we are working
  bankContract; etherAmount;

  handleKeyEnter = async (event) => {
    // check the key, if it is enter
    if (event.keyCode === 13 && this.state.selectedOption !== ''){
      // hide the window, while data will be processed
      this.setState({ _isRendered: false });
      alert("Please, wait while the transaction is being processed");

      // variables for parsing data
      let inputText = document.getElementsByName("text")[0];
      let args = inputText.value;
      let res;
      inputText.value = "";

      if(args.includes(','))
        args = args.split(',');

      // ALL FUNCTIONALITY OF OPTIONS
      switch(this.state.selectedOption){
        case 'request-loan':
          this.etherAmount = args[0];
          await this.bankContract.methods.requestLoan(this.etherAmount, args[1], args[2]).send({from: this.state.borrower});
          break;
        case 'provide-guarantee':
          await this.bankContract.methods.provideGuarantee(args[0], args[1]).send({from: this.state.guarantor, gas: 500000, value: this.etherAmount});
          break;
        case 'handle-guarantee':
          await this.bankContract.methods.handleGuarantee(args[0], args[1]).send({from: this.state.borrower});
          break;
        case 'provide-loan':
          await this.bankContract.methods.provideLoanForLoanee(args).send({from: this.state.lender, gas: 500000, value: this.etherAmount});
          break;
        case 'check-paid-back':
          await this.bankContract.methods.isBorrowerTransferEtherAtTime(args).send({from: this.state.lender});
          res = await this.bankContract.methods.getLoanState(args).call({from: this.state.lender});
          if(res === false){
            alert("The borrower overdue loan repayment date");
          }
          else{
            alert("The borrower follows the conditions");
          }
          break;
        case 'get-loan-info':
          res = await this.bankContract.methods.getLoansInfo(args).call({from: this.state.lender});
          alert("Information about a loan with a given index" + 
                "\n1) Count of loans in system: " + res[0] +
                "\n2) Does guarantee provided: " + res[1] +
                "\n3) Interest of loan, which should receive lender in ether: " + res[2] +
                "\n4) Address of guarantor: " + res[3]);
          break;
        case 'pay-back-loan':
          await this.bankContract.methods.payBackLoan(args).send({from: this.state.borrower, gas: 500000, value: this.etherAmount});
          break;
        default:
          break;
      }
      this.setState({ _isRendered: true });
    }
  }

  handleOptionChange = async (event) => {
    await this.setState({
      selectedOption: event.target.value
    });

    setTimeout(() => {
      let introText = "Please enter the following data separated by commas and after that press key «Enter»\n";

      switch(this.state.selectedOption){
        case 'request-loan':
          alert(introText + 
                "1) Amount of ether, which you want to borrow\n" +
                "2) Date when you repay the loan\n" +
                "3) Interest for which you take a loan");
          break;
        case 'handle-guarantee':
          alert(introText + 
                "1) Index of the loan\n" +
                "2) If you want to accept a guarantee just enter «true», if not, then «false»\n");
          break;
        case 'provide-guarantee':
          alert(introText + 
                "1) Index of the loan\n" +
                "2) Guarantee interest\n");
          break;
        default:
          alert(introText + 
                "1) Index of the loan");
      }
    }, 100);
  }

  // handling of changing account(timer inside of function)
  handleAccoutChange = async () => {
    // getting current account
    this.setState({ currentAccount: await web3.eth.getAccounts().then((res) => { return res[0]; }) });

    // binding account address to role of account
    if(this.state.currentAccount !== undefined){
      if (this.state.borrower === '' && this.state.guarantor === '' && this.state.lender === '')
        this.setState({ borrower: this.state.currentAccount });
      else if(this.state.borrower !== this.state.currentAccount && this.state.guarantor === '')
        this.setState({ guarantor: this.state.currentAccount });
      else if(this.state.borrower !== this.state.currentAccount && this.state.guarantor !== this.state.currentAccount && this.state.lender === '')
        this.setState({ lender: this.state.currentAccount });
    }

    // defining role of current account
    switch(this.state.currentAccount){
      case this.state.borrower:
        this.setState({ value: "borrower" });
        break;
      case this.state.guarantor:
        this.setState({ value: "guarantor" });
        break;
      case this.state.lender:
        this.setState({ value: "lender" });
        break;
      default:
        this.setState({ value: "unregistered user" });
    }
  }

  // the constructor() method is called before anything else, when the component is initiated
  constructor(){
    // calling parent component contructor(should be called before using 'this')
    super();

    // setup web3 and provider
    setupWeb3();

    // setting interval for handling role of account
    setInterval(this.handleAccoutChange, 100);

    // deploying a contract
    this.bankContract = new web3.eth.Contract(abi, contractAddress);
  }

  // the componentDidMount() method is called after the component is rendered
  componentDidMount(){
    // a timer, that shows a window with options, after 5 seconds as the page was loaded
    setTimeout(async () => {
      await this.setState({ _isRendered: true });
    }, 500);

    // a timer, that shows an alert with message, which explains how to choose the option
    setTimeout(async () => {
      alert("To select an option, click on the gray circle")
    }, 500);

    // we have added event listener of enter key
    window.addEventListener("keyup", this.handleKeyEnter);
  }
  render() {
    return (
      <>
        <div className="bank-window" style={ this.state._isRendered === true ? { display: 'flex' } : { display: 'none' } }>
          <div className="container">
            <p className="current-account">account of <span>{ this.state.value }</span></p>
            <div className="borrower" style={ this.state.value === "borrower" ? { display: 'block' } : { display: 'none' } }>
              <label className="container">Request loan
                <input type="radio" name="radio"
                                    value='request-loan' 
                                    checked={ this.state.selectedOption === 'request-loan' }  
                                    onChange={this.handleOptionChange}/>
                <span className="checkmark"></span>
              </label>
              <label className="container">Handle guarantee
                <input type="radio" name="radio"
                                    value='handle-guarantee' 
                                    checked={ this.state.selectedOption === 'handle-guarantee' }  
                                    onChange={this.handleOptionChange}/>
                <span className="checkmark"></span>
              </label>
              <label className="container">Pay back loan
                <input type="radio" name="radio"
                                    value='pay-back-loan' 
                                    checked={ this.state.selectedOption === 'pay-back-loan' }  
                                    onChange={this.handleOptionChange}/>
                <span className="checkmark"></span>
              </label>
            </div>
            <div className="guarantor" style={ this.state.value === "guarantor" ? { display: 'block' } : { display: 'none' } }>
              <label className="container">Provide guarantee
                <input type="radio" name="radio"
                                    value='provide-guarantee' 
                                    checked={ this.state.selectedOption === 'provide-guarantee' }  
                                    onChange={ this.handleOptionChange }/>
                <span className="checkmark"></span>
              </label>
            </div>
            <div className="lender" style={ this.state.value === "lender" ? { display: 'block' } : { display: 'none' } }>
              <label className="container">If the borrower paid the loan on time
                <input type="radio" name="radio"
                                    value='check-paid-back' 
                                    checked={ this.state.selectedOption === 'check-paid-back' }  
                                    onChange={ this.handleOptionChange }/>
                <span className="checkmark"></span>
              </label>
              <label className="container">Provide loan for loanee
                <input type="radio" name="radio"
                                    value='provide-loan' 
                                    checked={ this.state.selectedOption === 'provide-loan' }  
                                    onChange={ this.handleOptionChange }/>
                <span className="checkmark"></span>
              </label>
              <label className="container">Get loan information
                <input type="radio" name="radio"
                                    value='get-loan-info' 
                                    checked={ this.state.selectedOption === 'get-loan-info' }  
                                    onChange={ this.handleOptionChange }/>
                <span className="checkmark"></span>
              </label>
            </div>
            <input type="text" name="text" 
                     style={ this.state.value === "borrower" || 
                            this.state.value === "guarantor" || this.state.value === "lender" ?
                              { display: 'block' } : { display: 'none' } }/>
          </div>
        </div>
      </>
    );
  }
}

export default App;