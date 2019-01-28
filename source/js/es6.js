// let ary = [1,2,3,4,5,6];

// let [ a, b, ...c ] = ary

// console.log(a,b,c);
//

// function test({aa='aaa',bb='bbb',cc='ccc'}={}) {
//     console.log(aa,bb,cc);
// }
// test();
//

// let dylan = {
//     name: 'dylan',
//     type: 'A',
//     sex: 'male'
// }
// console.log(name,type,sex);

// let {name,type,sex} = dylan;
// console.log(name,type,sex);

//

// let name = 'dylan';
// let sex = 'male';

// let dylan = {
//     name,
//     sex
// }

// console.log(dylan);

//-------promise & async/await非同步
function fn1() {
    return new Promise((resolve, reject) => {
        setTimeout(function () {
            console.log('我會先輸出');
            resolve()
        }, 0)
    })
}

function fn2() {
    console.log('我會後輸出')
}

function fn3() {
    setTimeout(function () {
        console.log('test')
    }, 0)
}

//promise處理後 順序正常
// fn1().then(fn2)  

//async/await方式 可取代promise
// async function test() {
//     await fn1();
//     fn2();
// }
// test()

//正常寫法,執行續不如預期
// function test() {
//     fn3()
//     fn2()
// }
// test()