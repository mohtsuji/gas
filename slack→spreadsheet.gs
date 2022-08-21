//slackに投稿があった場合にeventを受け取る
function doPost(e){
  const SHEET = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('整形')
  var params = JSON.parse(e.postData.getDataAsString());

  // これはslackbotのurl検証用コード
  if(params.type == 'url_verification') { 
    return ContentService.createTextOutput(params.challenge);
  }

  console.log(params)

  //特定のチャンネルの投稿のみ取得
  const CHANNEL = PropertiesService.getScriptProperties().getProperty("CHANNEL");
  if (params.event.channel == CHANNEL && params.event.type == 'message') {
    const memberList = getUser();  // メンバーリスト取得

    if (params.event.thread_ts) { //それがリプライであった場合
      tsLocation = getThread(params.event.thread_ts, SHEET) //SpreadSheet上でthreadのもとの投稿が記録されている位置を取得
      appendReply(params, SHEET, tsLocation); //replyを書き込む
    } else {
      //SpreadSheetの書き込む場所を特定するためにIDのみ抽出
      let text = params.event.text.split('\n');
      let id = text[0]; //textの1行目（IDのみ）を取得
      let idLocation = isCorrectId(SHEET, id); //入力するセルの位置を取得。入力された地域とIDに一致するものが見つかるかを探す。見つからなければその他に分類する
      sendSpreadsheet(SHEET, params, idLocation); //スプレッドシートに書き込む 
    }
  }
}

function sendSpreadsheet(SHEET, params, idLocation) {
  //formに入力されたIDの列の空白セルを取得する（横向きに空白セルを検索していく）
  //とりあえず50行まで検索すれば空白セルは現れるだろう
  for (let i = 3; i < 50; ) {
    cellLocation = SHEET.getRange(idLocation, i);
    if (cellLocation.isBlank() == true) {
      cellLocation.setValue(params.event.ts); //空白行にtsを記入
      SHEET.getRange(idLocation, i+1).setValue(params.event.text); //次の空白行にtextを記入
      break;
    }
    else if (i > 48) {
      console.error('IDが見つかりませんでした')
    }
    i+=2;//必ずtsとtextで2行ずつ消費しているので，1つ飛ばしで検索する
  }
}

//入力された地域とIDに一致するものが見つかるかを探す。見つからなければその他に分類する
function isCorrectId(SHEET, id) {
  //整形シートのID行を取得して1次元配列に直し，formに入力されたIDを検索できるようにする
  let data = SHEET.getRange(2, 2, SHEET.getLastRow() - 1).getValues(); //2行目を2列めから最終列まで取得
  data = data.flat();//2次元配列を1次元配列に治す

  let idLocation = data.indexOf(id); //formに入力されたIDの列のインデックスを取得
  
  if (idLocation == -1) { //indexOfで見つからなかったときは-1が返ってくる
    idLocation = data.indexOf('その他') + 2; //その他のインデックスを入れる
  } else {
    idLocation += 2; //インデックス位置を調整する
  }
  return (idLocation)
}

function appendEdited(params, SHEET, tsLocation) {
  //threadの列の空白セルを取得する（横向きに空白セルを検索していく）
  //とりあえず100行まで検索すれば空白セルは現れるだろう
  for (let i = 2; i < 100; i++) {
    cellLocation = SHEET.getRange(tsLocation, i);
    if (cellLocation.isBlank() == true) {
      let body = '編集\n'+params.event.message.text;
      cellLocation.setValue(body)
      break;
    }
    else if (i == 99) {
      console.error('threadが見つかりませんでした')
    }
  }
}

function appendReply(params, SHEET, tsLocation) {
  //threadの列の空白セルを取得する（横向きに空白セルを検索していく）
  //とりあえず100行まで検索すれば空白セルは現れるだろう
  for (let i = 2; i < 100; i++) {
    cellLocation = SHEET.getRange(tsLocation, i);
    if (cellLocation.isBlank() == true) {
      let body = 'リプライ\n'+params.event.text;
      cellLocation.setValue(body)
      break;
    }
    else if (i == 99) {
      console.error('threadが見つかりませんでした')
    }
  }
}

function getThread(threadTs, SHEET) {
  //読み込みシートのTS行を取得して1次元配列に直し，TSを検索できるようにする
  let data = SHEET.getRange(2, 5, SHEET.getLastRow() - 1).getValues(); //5行目を2列めから最終列まで取得
  data = data.flat();//2次元配列を1次元配列に治す

  //spreadSheetが勝手に小数点以下を５桁にしてしまうので，検索でちゃんと見つけられるように５桁に揃える
  threadTs = Number(threadTs);
  threadTs = Math.floor(threadTs*100000)/100000
  let tsLocation = data.indexOf(threadTs); //thread_tsの列のインデックスを取得

  if (tsLocation == -1) { //indexOfで見つからなかったときは-1が返ってくる
    tsLocation = data.indexOf('その他') + 2; //その他のインデックスを入れる
  } else {
    tsLocation += 2; //インデックス位置を調整する
  }
  return (tsLocation)
}

function getUser(cursor) {
  const TOKEN = PropertiesService.getScriptProperties().getProperty('TOKEN');
  const limit =500;
  const options = {
    "method" : "get",
    "contentType": "application/x-www-form-urlencoded",
    "payload" : { 
      "token": TOKEN,      
      "cursor": cursor,
      "limit":limit
    }
  }; 
  const url = "https://slack.com/api/users.list";
  const response = UrlFetchApp.fetch(url, options);
  const members = JSON.parse(response).members;
  
  //userのIDと名前を連想配列にして対応させる
  var memberList = {};
  for (const member of members) {
    memberList[member.id] = member.profile.real_name
  }
  return (memberList)
}









