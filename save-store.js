exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }
  try {
    const { password, data } = JSON.parse(event.body || "{}");
    const BIN_ID = process.env.JSONBIN_BIN_ID;
    const MASTER_KEY = process.env.JSONBIN_MASTER_KEY;

    // Re-check the password against what's currently stored, server-side only.
    const currentRes = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
      headers: { "X-Master-Key": MASTER_KEY }
    });
    const currentJson = await currentRes.json();
    const realPassword = (currentJson.record && currentJson.record.adminPassword) || "";

    if (!realPassword || password !== realPassword) {
      return {
        statusCode: 401,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ok: false, error: "كلمة السر خاطئة" })
      };
    }

    const putRes = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Master-Key": MASTER_KEY
      },
      body: JSON.stringify(data)
    });

    if (!putRes.ok) {
      const t = await putRes.text();
      return { statusCode: putRes.status, body: JSON.stringify({ ok: false, error: t }) };
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ok: true })
    };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ ok: false, error: e.message }) };
  }
};
