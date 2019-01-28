// ===========字串===========
// -344 Reverse String
// 將一個字串反轉後回傳。
// 範例： s= "hello", return "olleh"
//-----------------------------
// function reserveStr(str){
//     var result = '';
//     var ary = str.split('');

//     for(var i = ary.length-1 ; i >= 0 ; i--){
//         result = result + ary[i];  //從後面串回字串
//     }
//     return result;  
// }

// console.log(reserveStr('dylan'));

// function test(str){
//     var ary = str.split(' ',3);
//     console.log(ary);
// }

// test('How are you doing today?')
//-----------------------------
//292. Nim Game
// 拿石頭遊戲規則，桌上有石頭n個，兩個玩家，你先玩，每次每個玩家可以拿走1~3個石頭，拿走最後一顆石頭的人獲勝，根據以上規則與初始的石頭數量，判斷你是否能贏得這個拿石頭遊戲。
// 例如說，如果桌上有三顆石頭，你一次全拿，獲勝。
// 如果桌上有4顆石頭，不管你拿走幾顆，你的對手都會獲勝
//-----------------------------
function stoneGame(){
    var num = Math.floor(Math.random()*10)
    console.log(num);
    if(num < 4) {console.log('win')}
    else if (num%4 !=0) {console.log('lose')}
}
stoneGame();