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

    var candidatorLength = await contract.methods.getCandidatorCount().call({from:account})
    console.log(candidatorLength)

    k = []
    for (var i=0; i<candidatorLength; i++) {
        k.push(await contract.methods.candidatorList(i).call())
    }

    let data = {
        'title' : await contract.methods.title().call(),
        'candidators' : k,
        'startDateTime' : await contract.methods.startDateTime().call(),
        'endDateTime' : await contract.methods.endDateTime().call(),
        'live' : await contract.methods.live().call(),
        'owner': await contract.methods.owner().call()
    }
    return data
}

async function finishVote(address) {
    let abi  = await $.getJSON('./abi.json');
    // console.log(web3.eth.Contract)
    let contract = new web3.eth.Contract(abi,address);
    await contract.methods.finishVote().send({
        from: account
    })
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

    insert_contract(constructor_args[0], contractInstance.options.address, account)
}

async function upVote(address, data) {
    let abi  = await $.getJSON('./abi.json');
    let contract = new web3.eth.Contract(abi,address);
    console.log(data)
    try {
        await contract.methods.upVote(data).send({
            from: account
        })
    } catch (e) {
        alert('중복 투표할 수 없습니다');
    }

}

function dateFormat(date) {
    // date.setUTCHours(-9);
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

    // return date.getFullYear() + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second;
    return date.getFullYear() + '-' + month + '-' + day;
}