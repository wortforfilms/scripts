# Radio Live Scaffold

This service connects Maataa playout-worker to a real streaming pipeline.

## Stack
- Icecast (stream server)
- Liquidsoap (audio playout)
- Maataa scheduler → feeds playlist

## Next Steps
1. Install Icecast locally
2. Install Liquidsoap
3. Wire scheduler output to Liquidsoap input
4. Expose stream via Caddy

## Target Stream URL
http://localhost:8000/stream

Replace with domain:
radio.vaigyaaniq.info
