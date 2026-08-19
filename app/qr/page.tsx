import { headers } from "next/headers";
import QrCard from "./qr-card";

export default async function QrPage() {
  const hdrs = await headers();
  const host = hdrs.get("host") || "localhost:3000";
  const proto = host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : "https";
  const url = `${proto}://${host}`;

  return <QrCard url={url} />;
}
