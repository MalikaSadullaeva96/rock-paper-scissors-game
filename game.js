var readlineSync = require('readline-sync');
const { Table } = require('console-table-printer');
const crypto = require('crypto');

class Node{
    constructor(value,next,prev){
        this.value = value;
        this.next = next;
        this.prev = prev;
    }
}
class LinkedList{
    constructor(){
        this.head = null;
        this.tail = null;
    }
    //function for creating linked list
    addToTail(value){
        var newNode = new Node(value, null, this.tail); 
        if(this.tail){
            this.tail.next = newNode;
        }else{
            this.head = newNode;
        }
        this.tail = newNode;
    }
    //function for retunring win answer
    search(searchValue,size){
        let winChoice = [];
        var currentNode = this.head;
        size = (size - 1) / 2;
        let i = 0;
        while(currentNode){
            if(currentNode.value === searchValue){
                while(i < size){
                    if(currentNode.value === this.tail.value && i===0){
                        currentNode = this.head;
                        winChoice.push(currentNode.value);
                        i = i + 1;
                        if(i === size){
                            return winChoice;
                        }
                    }
                    if(currentNode.value === this.tail.value && i!==0){
                        currentNode = this.head;
                        winChoice.push(currentNode.value);
                        i = i + 1;
                        if(i === size){
                            return winChoice
                        }
                    }
                    currentNode = currentNode.next;
                    winChoice.push(currentNode.value);;
                    i = i + 1;
                }
                return winChoice;
            }
    
            currentNode = currentNode.next;
        }
        return null;
    }
}
//decide who won
class Winner{
    constructor(user, machine, arr,key){
        this.user = user;
        this.machine = machine;
        this.arr = arr;
        this.key = key;
    }
    getUser(){
        return this.user;
    }
    getMachine(){
        return this.machine;
    }
    getWinAnsw(){
        return this.arr;
    }
    getInitKey(){
        return this.key;
    }

    selectWinner(){
        let userAnsw = this.getUser();
        let comAnsw = this.getMachine();
        let arrOfAnsw = this.getWinAnsw();
        if(userAnsw === 'help'){
            return;
        }
        if(arrOfAnsw.includes(userAnsw)){
            console.log('You win!');
            console.log('HMAC key: '+this.getInitKey());
            console.log();
            console.log();
        }
        else if(userAnsw === comAnsw){
            console.log('Draw!');
            console.log('HMAC key: '+this.getInitKey());
            console.log();
            console.log();
        }
        else{
            console.log('Computer win!');
            console.log('HMAC key: '+this.getInitKey());
            console.log();
            console.log();
        }
    }
}

class DrawTable{
        constructor(object){
            this.object = object;
        }
        getAnswer(){
            return this.object;
        }
        print(){
            let store = this.getAnswer();
            let p = new Table();
            for(let key of Object.keys(store)){
                let i = 0, k = 0;
                const round = store[key];
                while(true){
                    if(i === 0 && k === 0){
                        p.addRow({
                            userSelect: round.userSelect,
                            win: round.win[i],
                            lost: round.lost[i],
                            draw: round.draw[i],
                        })
                    }else{
                        p.addRow({
                            win: round.win[i],
                            lost: round.lost[i],
                            draw: round.draw[i],
                        })
                    }
                    i++;
                    k++;
                    if (i >= round.win.length && k >= round.draw.length){
                        break;
                    }
                }
            }
            p.printTable();
        }
}

//crypto
class HMAC {
    constructor(key) {
      this.key = key;
    }
    computeHMAC(data) {
      const hmac = crypto.createHmac('sha256', this.key);
      hmac.update(data);
      console.log('HMAC: '+ hmac.digest('hex'));
      return hmac.digest('hex');
    }
  }


// print menu & safe user selection
const userSelection = (arr,compChoice) =>{
    console.log('Available moves');
    let arr2 = [];
    arr2[0] = 'exit';
    arr2['?'] = 'help';
    for(let i=1, j = 0; j<arr.length; i++, j++){
        arr2[i] = arr[j];
        console.log((i)+' - '+arr2[i]);
    }
    console.log('0' + ' - '+arr2[0]);
    console.log('?' + ' - '+arr2['?']);
    let userChoice = readlineSync.question('Enter your move: ');
    
    if(arr2[userChoice] !=='exit' && arr2[userChoice] !=='help'){
        console.log('Your move: '+arr2[userChoice]);
        console.log('Computer move: '+compChoice);
    }
    return arr2[userChoice];
}

//create instance of classes, call funciton
let userChoice;
let input = process.argv.slice(2);
if(input.length % 2 === 0){
    console.error("Error: You must provide even number of moves.");
    console.error("Example: node game.js rock paper scissors");
    process.exit(1);
}
if (input.length < 3) {
    console.error("Error: You must provide at least three moves.");
    console.error("Example: node game.js rock paper scissors");
    process.exit(1);
  }
  const uniqueInput = new Set(input);
  if (uniqueInput.size !== input.length) {
    console.error("Error: Moves must be non-repeating strings.");
    console.error("Example: node game.js rock paper scissors");
    process.exit(1);
  }

let size = input.length;
let globalStore = {};
let index = 0;
let count = 0;
while(userChoice !== 'exit'){
    count ++;
    let compChoice = input[Math.floor(Math.random() * input.length)];
    // drawStor.push(compChoice);
    const key = new Uint8Array(32);
    let initKey = crypto.getRandomValues(key);
    let ranKey = new HMAC(initKey);
    console.log();
    ranKey.computeHMAC(compChoice);

    let values = new LinkedList();
    for(val of input){              //insert values to a linked list
        values.addToTail(val);
    }
    var winAnswers = values.search(compChoice,size);
    var lostAnswers = input.filter((val)=>!winAnswers.includes(val));
    lostAnswers = lostAnswers.filter((val)=>!compChoice.includes(val));

    userChoice = userSelection(input,compChoice);
    if(userChoice !== 'help'){
        globalStore[index++] = {
            userSelect: userChoice,
            win: winAnswers,
            lost: lostAnswers,
            draw: compChoice.split(' '),
        };
    }
    if(userChoice === 'exit'){
        return;
    }
    if(userChoice === 'help'){
        let draw = new DrawTable(globalStore);
        draw.print();
    }
    /*Select winner */
    const win = new Winner(userChoice,compChoice,winAnswers,initKey);
    win.selectWinner();
    /*End select winner */ 
}




