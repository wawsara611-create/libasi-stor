exports.handler = async function () {
  try {
    const BIN_ID = process.env.JSONBIN_BIN_ID;
    const MASTER_KEY = process.env.JSONBIN_MASTER_KEY;

    const res = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
      headers: { "X-Master-Key": MASTER_KEY }
    });

    if (!res.ok) {
      const t = await res.text();
      return { statusCode: res.status, body: t };
    }

    const json = await res.json();
    const record = json.record || {};
    delete record.adminPassword; // never send the password to visitors

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(record)
    };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};
