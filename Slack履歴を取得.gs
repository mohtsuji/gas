const SHEET = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('読み込み')
const TOKEN = PropertiesService.getScriptProperties().getProperty('TOKEN')
const CHANNEL = PropertiesService.getScriptProperties().getProperty('CHANNEL')


// Slackからメッセージ取得
function getSlackLog() {
  //  conversation.history(slack apiのURL)
  var requestUrl = 'https://slack.com/api/conversations.history?channel='+CHANNEL;
  var options = {
    "headers": { 'Authorization': 'Bearer ' + TOKEN }
  };
  var response = UrlFetchApp.fetch(requestUrl,options);  // URLを送ってslackの履歴をもらう
  let json = JSON.parse(response.getContentText());
  var messages = json.messages.reverse();//古い順に並べる

  const memberList = getUser();  // メンバーリスト取得
  for (const message of messages) {
    if (message.thread_ts){
      replyUrl = 'https://slack.com/api/conversations.replies';
      var payload = {
        "channel" : CHANNEL,
        "ts" : message.thread_ts
      }
      var re_options = {
        "headers": { 'Authorization': 'Bearer ' + TOKEN },
        "payload" : payload
      };
      replies = UrlFetchApp.fetch(replyUrl, re_options)
      let replyJson = JSON.parse(replies.getContentText());
      
      var count = 0;
      for (const message of replyJson.messages){
        if (count > 0) {
          SHEET.appendRow(["リプライ", memberList[message.user], message['text']]);
        } else {
          SHEET.appendRow(["", memberList[message.user], message['text']]);
        }
        count += 1;
      } 
    } else {
      SHEET.appendRow(["", memberList[message.user], message['text']])
    }
  }
}

function getUser(cursor) {
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
  
  