export async function GET() {
  const streamUrl =
    process.env.RADIO_STREAM_URL ??
    process.env.NEXT_PUBLIC_RADIO_STREAM_URL ??
    "http://localhost:8000/live.mp3";

  return Response.json({
    station: "Maataa Radio",
    streamUrl,
    fallbackStreamUrl: "http://localhost:8000/live.mp3"
  });
}
