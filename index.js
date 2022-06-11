var backend_server_uri = "http://localhost:8000"
var account;


function get_contracts_list() {
    var url = backend_server_uri + "/contracts";
    return $.ajax({
        type: "get",
        url: url,
        dataType : 'json',
		contentType : 'application/json'
    })
}

function insert_contract(name, address, owner_address) {
    var url = backend_server_uri + "/contracts"
    var data = {
        name: name,
        address: address,
        owner_address: owner_address
    };
    console.log(JSON.stringify(data))
    $.ajax({
        type: "POST",
        url: url,
        dataType : 'json',
		contentType : 'application/json', 
        data: JSON.stringify(data),
        success: function(data) {
            console.log(data)
        }
    })
}

async function get_info(address) {
    let abi  = await $.getJSON('./abi.json');
    // console.log(web3.eth.Contract)
    let contract = new web3.eth.Contract(abi,address);
    console.log(contract.methods)
    k0 = await contract.methods.candidatorList(0).call()
    k1 = await contract.methods.candidatorList(1).call()
    // k2 = await contract.methods.myFunction().call({from:account})
    // console.log(k2)
    k = [k0,k1]
    let data = {
        'title' : await contract.methods.title().call(),
        'candidators' : k,
        'startDateTime' : await contract.methods.startDateTime().call(),
        'endDateTime' : await contract.methods.endDateTime().call(),
    }
    return data
}

async function deploy(constructor_args) {
    let abi  = await $.getJSON('./abi.json');
    let bytecode = await $.getJSON('./bytecode.json');

    let simpleStorage = new web3.eth.Contract(abi);
    let contractInstance = await simpleStorage.deploy({
        data: '0x'+bytecode['object'],
        arguments: constructor_args
    }).send({
        from: account,
        gasPrice: '20000000000',
        gas: 1500000,
    }).on('error', function(error){
        console.log(error);
    });

    // console.log(constructor_args['title']);
    // console.log(contractInstance.address);
    // console.log(account);


    insert_contract(constructor_args[0], contractInstance.options.address, account)
}

async function upVote(address, data) {
    let abi  = await $.getJSON('./abi.json');
    let contract = new web3.eth.Contract(abi,address);
    console.log(data)
    await contract.methods.upVote(data).send({
        from: account
    })
}




// abi = JSON.parse('[{"constant":true,"inputs":[{"name":"candidate","type":"bytes32"}],"name":"totalVotesFor","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"candidate","type":"bytes32"}],"name":"validCandidate","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"bytes32"}],"name":"votesReceived","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"candidateList","outputs":[{"name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"candidate","type":"bytes32"}],"name":"voteForCandidate","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"candidateNames","type":"bytes32[]"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"}]')

// contract = new web3.eth.Contract(abi);
// contract.options.address = "0x14BaeB20C6E5000AF1B5874cDe44Cb6E8A42fb90";
// // update this contract address with your contract address

// candidates = {"Rama": "candidate-1", "Nick": "candidate-2", "Jose": "candidate-3"}

// function voteForCandidate(candidate) {
//  candidateName = $("#candidate").val();
//  console.log(candidateName);

//  contract.methods.voteForCandidate(web3.utils.asciiToHex(candidateName)).send({from: account}).then((f) => {
//   let div_id = candidates[candidateName];
//   contract.methods.totalVotesFor(web3.utils.asciiToHex(candidateName)).call().then((f) => {
//    $("#" + div_id).html(f);
//   })
//  })
// }

// $(document).ready(function() {
//  candidateNames = Object.keys(candidates);

//  for(var i=0; i<candidateNames.length; i++) {
//  let name = candidateNames[i];
  
//  contract.methods.totalVotesFor(web3.utils.asciiToHex(name)).call().then((f) => {
//   $("#" + candidates[name]).html(f);
//  })
//  }
// });


function dateFormat(date) {
    let month = date.getMonth() + 1;
    let day = date.getDate();
    let hour = date.getHours();
    let minute = date.getMinutes();
    let second = date.getSeconds();

    month = month >= 10 ? month : '0' + month;
    day = day >= 10 ? day : '0' + day;
    hour = hour >= 10 ? hour : '0' + hour;
    minute = minute >= 10 ? minute : '0' + minute;
    second = second >= 10 ? second : '0' + second;

    return date.getFullYear() + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second;
}