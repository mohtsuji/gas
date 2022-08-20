// /*
// やること
// ・Formの編集送信に対応
// */

// // function onEdit(e) {
// //   var range = e.range;
// //   range.setNote('最終更新日時: ' + new Date());
// // }

// //e = event object
// function autoReply(e) {
//   const SHEET = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('整形');

//   //e == undefined（編集時）, e != undefined（フォームからの通知時）
//   // if (typeof e === 'undefined') {
//   //   console.log('success')
//   // } else {
//     let [timeStamp, investigateDate, investigateTimeZone, location, id, personInvestigator, familyInvestigator, institution, opinions] = e.values;
//  // }

//   //idが全角で入力されていた場合，半角にする
//   id = hankaku2Zenkaku(id);

//   let ID;
//   if (location == '大和') {
//     ID = `Y${id}`;
//   } else if (location == '福岡') {
//     ID = `H${id}`;
//   } else if (location == '京都') {
//     ID = `K${id}`;
//   } else if (location == '湯沢') {
//     ID = `YZ${id}`;
//   } else if (location == '新潟') {
//     ID = `N${id}`;
//   } else {
//     ID = `${location}${id}`;
//   }
//   let slackBody = `
//   ${investigateDate}
//   ${investigateTimeZone}  ${ID}  ${institution}
//   本人: ${personInvestigator}   家族: ${familyInvestigator}
//   ${opinions}
//   `;
//   let spreadsheetBody = `
//   投稿日時 ${timeStamp}
//   調査日時 ${investigateDate}
//   ${investigateTimeZone}  ${ID}  ${institution}
//   本人: ${personInvestigator}   家族: ${familyInvestigator}
//   ${opinions}
//   `;

//   let idLocation = isCorrectId(SHEET, ID); //入力するセルの位置を取得。入力された地域とIDに一致するものが見つかるかを探す。見つからなければその他に分類する
//   notifySlack(slackBody); //slackに通知を送る
//   sendSpreadsheet(SHEET, spreadsheetBody, idLocation); //スプレッドシートに書き込む
// }

// //入力された地域とIDに一致するものが見つかるかを探す。見つからなければその他に分類する
// function isCorrectId(SHEET, ID) {
//   //整形シートのID行を取得して1次元配列に直し，formに入力されたIDを検索できるようにする
//   let data = SHEET.getRange(2, 2, SHEET.getLastRow() - 1).getValues(); //2行目を2列めから最終列まで取得
//   data = data.flat();//2次元配列を1次元配列に治す

//   let idLocation = data.indexOf(ID); //formに入力されたIDの列のインデックスを取得
  
//   if (idLocation == -1) { //indexOfで見つからなかったときは-1が返ってくる
//     idLocation = data.indexOf('その他') + 2; //その他のインデックスを入れる
//   } else {
//     idLocation += 2; //インデックス位置を調整する
//   }
//   return (idLocation)
// }

// function sendSpreadsheet(SHEET, body, idLocation) {
//   //formに入力されたIDの列の空白セルを取得する（横向きに空白セルを検索していく）
//   //とりあえず100行まで検索すれば空白セルは現れるだろう
//   for (let i = 2; i < 50; i++) {
//     cellLocation = SHEET.getRange(idLocation, i);
//     if (cellLocation.isBlank() == true) {
//       cellLocation.setValue(body)
//       break;
//     }
//     else if (i == 49) {
//       console.error('IDが見つかりませんでした')
//     }
//   }
// }

// function notifySlack(message) {
//   let postUrl = 'https://hooks.slack.com/services/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'
//   let userName = '調査実施報告bot';

//   let payload = {
//     username:userName,
//     text:message
//   };

//   let payloadJson =  JSON.stringify(payload);
//   let options = {
//     method:"POST",
//     contentType:"application/json",
//     payload:payloadJson
//   }

//   UrlFetchApp.fetch(postUrl, options);
// }

// function hankaku2Zenkaku(str) {
//     return str.replace(/[Ａ-Ｚａ-ｚ０-９]/g, function(s) {
//         return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
//     });
// }





