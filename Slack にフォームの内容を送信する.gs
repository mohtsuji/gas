//e = event object
function autoReply(e) {
  let [timeStamp, investigateDate, investigateTimeZone, location, id, personInvestigator, familyInvestigator, institution, opinions] = e.values;


  // let mailTo = "ohtsuji.mizuki@gmail.com";
  // let title = 'test';
  let body = `
  投稿日時 ${timeStamp},
  調査日時 ${investigateDate},
  時間帯 ${investigateTimeZone},
  地域 ${location},
  ID ${id},
  本人担当者 ${personInvestigator},
  家族担当者 ${familyInvestigator},
  施設 ${institution},
  所感 ${opinions}
  `;

  //GmailApp.sendEmail(mailTo, title, body);
  notifySlack(body)
}

function notifySlack(message) {
  let postUrl = 'https://hooks.slack.com/services/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'
  let userName = 'bot';

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
