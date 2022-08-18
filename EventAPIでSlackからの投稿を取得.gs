//次は編集を受け取れるようにする

function doPost(e){
  
  const SHEET = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('読み込み')
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
    
    //編集であった場合
    if (params.event.subtype === 'message_changed') {
      tsLocation = getThread(params.event.previous_message.ts, SHEET) //SpreadSheet上でthreadのもとの投稿が記録されている位置を取得
      appendEdited(params, SHEET, tsLocation);
    } else if (params.event.thread_ts) { //それがリプライであった場合
      tsLocation = getThread(params.event.thread_ts, SHEET) //SpreadSheet上でthreadのもとの投稿が記録されている位置を取得
      appendReply(params, SHEET, tsLocation); //replyを書き込む
    } else {
      const TYPE = params.event.type; //後でmessageではなく，投稿，編集などわかりやすくする
      const DATE = Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy/MM/dd HH:mm')
      const USER = memberList[params.event.user];
      const TEXT = params.event.text;
      const TS = String(params.event.ts);
      const DATA = [DATE, TYPE, USER, TEXT, TS]
      SHEET.appendRow(DATA)  
    }
  }
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
  const TOKEN = PropertiesService.getScriptProperties().getProperty('TOKEN')
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

function test() {
  var num = '1660633647.685631'
  num = Number(num)
  console.log(num)
  num = Math.floor(num*100000)/100000
  console.log(num)
}

function test2() {
  let tmp = ['tako','neko']
  console.log(tmp)
  console.log(tmp[0])
  console.log(tmp.find['tako'])
  console.log(tmp.indexOf('tako'))
  console.log(tmp.indexOf('ika'))
  console.log(tmp['tako'])
}











