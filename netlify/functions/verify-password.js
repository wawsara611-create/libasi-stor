exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }
  try {
    const { password } = JSON.parse(event.body || "{}");
    const BIN_ID = process.env.JSONBIN_BIN_ID;
    const MASTER_KEY = process.env.JSONBIN_MASTER_KEY;

    const res = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
      headers: { "X-Master-Key": MASTER_KEY }
    });
    const json = await res.json();
    const real = (json.record && json.record.adminPassword) || "";

    const ok = Boolean(real) && password === real;

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ok })
    };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ ok: false, error: e.message }) };
  }
};
