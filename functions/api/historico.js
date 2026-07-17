export async function onRequestGet(context) {
  const { env } = context;
  try {
    const list = await env.BACKUPS.list({ prefix: "backup_" });
    const backups = list.keys
      .map((k) => ({
        key: k.name,
        date: k.name.replace("backup_", "").replace(/[-]/g, ":").replace("T", " ").slice(0, 19),
      }))
      .sort((a, b) => b.key.localeCompare(a.key));

    return new Response(JSON.stringify(backups), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }
}
