//e = event object
function autoReply(e) {
  let [timeStamp, investigateDate, investigateTimeZone, location, id, personInvestigator, familyInvestigator, institution, opinions] = e.values;

  let locationId;
  if (location == '大和') {
    locationId = 'Y';
  } else if (location == '福岡') {
    locationId = 'H';
  } else if (location == '京都') {
    locationId = 'K';
  } else if (location == '湯沢') {
    locationId = 'YZ'
  } else if (location == '新潟') {
    locationId = 'N'
  } else {
    locationId = 'その他'
  }
  let slackBody = `
  ${investigateDate}
  ${investigateTimeZone}  ${locationId}${id}  ${institution}
  本人: ${personInvestigator}   家族: ${familyInvestigator}
  ${opinions}
  `;
  let spreadsheetBody = `
  投稿日時 ${timeStamp}
  調査日時 ${investigateDate}
  ${investigateTimeZone}   ${institution}
  本人: ${personInvestigator}   家族: ${familyInvestigator}
  ${opinions}
  `;
  const ID = `${locationId}${id}`;

  notifySlack(slackBody);
  sendSpreadsheet(spreadsheetBody, ID);
}

function sendSpreadsheet(body, ID) {
  const SHEET = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('整形');
  let data = SHEET.getRange(2, 2, SHEET.getLastRow() - 1).getValues(); //2行目を2列めから最終列まで取得
  data = data.flat();//2次元配列を1次元配列に治す

  for (let i = 2; i < 100; i++) {
    cellLocation = SHEET.getRange(data.indexOf(ID)+2, i);
    if (cellLocation.isBlank() == true) {
      cellLocation.setValue(body)
      break;
    }
    else if (i == 99) {
      Logger.log("error");
    }
  }
}

function notifySlack(message) {
  let postUrl = 'https://hooks.slack.com/services/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'
  let userName = '調査実施報告bot';

  let payload = {
    username:userName,
    text:message
  };

  let payloadJson =  JSON.stringify(payload);
  let options = {
    method:"POST",
    contentType:"application/json",
    payload:payloadJson
  }

  UrlFetchApp.fetch(postUrl, options);
}
