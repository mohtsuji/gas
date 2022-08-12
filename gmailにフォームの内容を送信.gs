//e = event object
function autoReply(e) {
  let [timeStamp, date, location, id, personInvestigator, familyInvestigator, institution, opinions] = e.values;


  let mailTo = "ohtsuji.mizuki@gmail.com";
  let title = 'test';
  let body = `
  投稿日時 ${timeStamp},
  日付 ${date},
  地域 ${location},
  ID ${id},
  本人担当者 ${personInvestigator},
  家族担当者 ${familyInvestigator},
  施設 ${institution},
  所感 ${opinions}
  `;

  GmailApp.sendEmail(mailTo, title, body);
}

