const SS = SpreadsheetApp.getActiveSpreadsheet();
const sheet = SS.getSheetByName("TRANSAKSI");
const userSheet = SS.getSheetByName("USERS");

function doGet() {
  const data = sheet.getDataRange().getValues();
  const headers = data.shift();
  const result = data.map((row) => {
    let obj = {};
    headers.forEach((header, i) => (obj[header.toLowerCase()] = row[i]));
    return obj;
  });
  return ContentService.createTextOutput(
    JSON.stringify(result.reverse()),
  ).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    // Penanganan agar tidak error saat e.postData kosong
    let params;
    if (e.postData && e.postData.contents) {
      params = JSON.parse(e.postData.contents);
    } else {
      params = e.parameter; // Mengambil data jika dikirim via FormData
    }

    const action = params.action; // --- FUNGSI LOGIN DINAMIS ---

    if (action === "login") {
      const userData = userSheet.getDataRange().getValues();
      for (let i = 1; i < userData.length; i++) {
        if (
          userData[i][0] == params.username &&
          userData[i][1] == params.password
        ) {
          return ContentService.createTextOutput(
            JSON.stringify({
              status: "success",
              role: userData[i][3], // Kolom D: Role
              nama: userData[i][2], // Kolom C: Nama Lengkap
              token: Utilities.base64Encode(
                params.username + ":" + new Date().getTime(),
              ),
            }),
          ).setMimeType(ContentService.MimeType.JSON);
        }
      }
      return response("error", "Username atau Password salah!");
    } // --- FUNGSI TRANSAKSI ---

    if (action === "insert") {
      sheet.appendRow([
        Date.now(),
        params.tanggal,
        params.jenis,
        params.kategori,
        params.nominal,
        params.keterangan,
      ]);
      return response("success", "Data berhasil disimpan");
    }
    if (action === "update") {
      const data = sheet.getDataRange().getValues();
      for (let i = 1; i < data.length; i++) {
        if (data[i][0] == params.id) {
          sheet
            .getRange(i + 1, 2, 1, 5)
            .setValues([
              [
                params.tanggal,
                params.jenis,
                params.kategori,
                params.nominal,
                params.keterangan,
              ],
            ]);
          return response("success", "Data diperbarui");
        }
      }
    }

    if (action === "delete") {
      const data = sheet.getDataRange().getValues();
      for (let i = 1; i < data.length; i++) {
        if (data[i][0] == params.id) {
          sheet.deleteRow(i + 1);
          return response("success", "Data dihapus");
        }
      }
    }
  } catch (err) {
    return response("error", "Server Error: " + err.toString());
  }
}

function response(status, message) {
  return ContentService.createTextOutput(
    JSON.stringify({ status, message }),
  ).setMimeType(ContentService.MimeType.JSON);
}
