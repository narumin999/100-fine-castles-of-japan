import { APP_CONFIG } from '../config/appConfig';

// フォルダの取得または作成
export async function getOrCreateFolder(token, folderName, parentId = null) {
  let q = `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
  if (parentId) q += ` and '${parentId}' in parents`;

  const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await res.json();

  if (data.files && data.files.length > 0) {
    return data.files[0].id;
  } else {
    const metadata = { name: folderName, mimeType: 'application/vnd.google-apps.folder' };
    if (parentId) metadata.parents = [parentId];

    const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(metadata)
    });
    const createData = await createRes.json();
    return createData.id;
  }
}

// ユーザーデータ（user_data.json）の取得
export async function getUserData(token, folderId) {
  const q = `name='user_data.json' and '${folderId}' in parents and trashed=false`;
  const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await res.json();

  if (data.files && data.files.length > 0) {
    const fileId = data.files[0].id;
    const fileRes = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const records = await fileRes.json();
    return { fileId, records };
  } else {
    return { fileId: null, records: {} };
  }
}

// ユーザーデータの保存
export async function saveUserData(token, folderId, existingFileId, records) {
  const boundary = '-------314159265358979323846';
  const delimiter = "\r\n--" + boundary + "\r\n";
  const close_delim = "\r\n--" + boundary + "--";

  const metadata = { name: 'user_data.json', mimeType: 'application/json' };
  if (!existingFileId) metadata.parents = [folderId];

  const multipartRequestBody =
    delimiter + 'Content-Type: application/json\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter + 'Content-Type: application/json\r\n\r\n' +
    JSON.stringify(records, null, 2) + close_delim;

  const url = existingFileId
    ? `https://www.googleapis.com/upload/drive/v3/files/${existingFileId}?uploadType=multipart`
    : `https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart`;
  const method = existingFileId ? 'PATCH' : 'POST';

  const res = await fetch(url, {
    method: method,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': `multipart/related; boundary=${boundary}`
    },
    body: multipartRequestBody
  });
  const data = await res.json();
  return data.id;
}

// 実績のメモHTMLを保存する関数
export async function saveHtmlFile(token, htmlFolderId, title, displayDate, locationStr, text, imgIds) {
  let locationHtml = locationStr ? `<p style="color:#666;">場所: <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationStr)}" target="_blank">${locationStr}</a></p>` : '';
  
  let htmlContent = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${title}</title></head><body style="font-family:sans-serif;padding:16px;max-width:800px;margin:0 auto;"><h2>${title}</h2><p style="color:#666;">日時: ${displayDate}</p>${locationHtml}<div style="line-height:1.6;margin-top:16px;">${text}</div>`;
  
  if (imgIds && imgIds.length > 0) {
    htmlContent += `<hr style="margin:20px 0;"><p>添付写真:</p><div style="display:flex;flex-wrap:wrap;gap:10px;">`;
    imgIds.forEach(id => {
      htmlContent += `<a href="https://drive.google.com/file/d/${id}/view" target="_blank"><img src="https://drive.google.com/thumbnail?id=${id}&sz=w800" style="max-height:200px;border-radius:8px;"></a>`;
    });
    htmlContent += `</div>`;
  }
  htmlContent += `</body></html>`;

  const boundary = '-------314159265358979323846';
  const delimiter = "\r\n--" + boundary + "\r\n";
  const close_delim = "\r\n--" + boundary + "--";
  const metadata = { name: `${title}_${displayDate.slice(0,10)}.html`, mimeType: 'text/html', parents: [htmlFolderId] };

  const multipartRequestBody =
    delimiter + 'Content-Type: application/json\r\n\r\n' + JSON.stringify(metadata) +
    delimiter + 'Content-Type: text/html\r\n\r\n' + htmlContent + close_delim;

  const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': `multipart/related; boundary=${boundary}` },
    body: multipartRequestBody
  });
  const data = await res.json();
  return data.id;
}
