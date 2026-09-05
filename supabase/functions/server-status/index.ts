const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface SampServerInfo {
  online: boolean;
  hostname: string;
  gamemode: string;
  language: string;
  players: number;
  maxPlayers: number;
  ping: number;
  rules: Record<string, string>;
}

function readString(data: Uint8Array, offset: number): { value: string; next: number } {
  let str = "";
  let i = offset;
  while (i < data.length && data[i] !== 0) {
    str += String.fromCharCode(data[i]);
    i++;
  }
  return { value: str, next: i + 1 };
}

function readInt32(data: Uint8Array, offset: number): number {
  return (data[offset]) | (data[offset + 1] << 8) | (data[offset + 2] << 16) | (data[offset + 3] << 24);
}

function readUint16(data: Uint8Array, offset: number): number {
  return (data[offset]) | (data[offset + 1] << 8);
}

async function querySampServer(ip: string, port: number, timeoutMs = 5000): Promise<SampServerInfo> {
  return new Promise((resolve) => {
    const startTime = Date.now();
    let socket: Deno.DatagramConn | null = null;
    let timer: number | undefined;

    const cleanup = () => {
      if (timer) clearTimeout(timer);
      if (socket) { try { socket.close(); } catch { /* ignore */ } }
    };

    const fail = () => {
      cleanup();
      resolve({
        online: false,
        hostname: "",
        gamemode: "",
        language: "",
        players: 0,
        maxPlayers: 0,
        ping: 0,
        rules: {},
      });
    };

    timer = setTimeout(fail, timeoutMs);

    try {
      socket = Deno.listenDatagram({
        hostname: "0.0.0.0",
        port: 0,
        transport: "udp",
      });

      // SA-MP "i" (info) query packet
      const prefix = new TextEncoder().encode("SAMP");
      const ipParts = ip.split(".").map(Number);
      const portBytes = new Uint8Array(2);
      portBytes[0] = port & 0xFF;
      portBytes[1] = (port >> 8) & 0xFF;

      const packet = new Uint8Array(15 + 1);
      packet.set(prefix, 0);
      packet[4] = ipParts[0] & 0xFF;
      packet[5] = ipParts[1] & 0xFF;
      packet[6] = ipParts[2] & 0xFF;
      packet[7] = ipParts[3] & 0xFF;
      packet[8] = portBytes[0];
      packet[9] = portBytes[1];
      packet[10] = 0; // additional port bytes for some servers
      packet[11] = 0;
      // "i" info query
      packet[15] = 0x69; // 'i'

      socket.send(packet, { hostname: ip, port, transport: "udp" });

      socket.read().then((response: Uint8Array | null) => {
        if (!response || response.length < 20) {
          fail();
          return;
        }

        const ping = Date.now() - startTime;

        // Response starts with "SAMP" + ip(4) + port(2) + 'i'
        // Then: hostname_len(2), hostname, gamemode_len(2), gamemode, language_len(2), language, players(2), maxplayers(2)
        let offset = 11; // Skip "SAMP" + ip + port + 'i'

        const hostnameLen = readUint16(response, offset);
        offset += 2;
        const hostname = new TextDecoder().decode(response.subarray(offset, offset + hostnameLen));
        offset += hostnameLen;

        const gamemodeLen = readUint16(response, offset);
        offset += 2;
        const gamemode = new TextDecoder().decode(response.subarray(offset, offset + gamemodeLen));
        offset += gamemodeLen;

        const languageLen = readUint16(response, offset);
        offset += 2;
        const language = new TextDecoder().decode(response.subarray(offset, offset + languageLen));
        offset += languageLen;

        const players = readUint16(response, offset);
        offset += 2;
        const maxPlayers = readUint16(response, offset);
        offset += 2;

        cleanup();
        resolve({
          online: true,
          hostname: hostname || "SEA TRIBE RP",
          gamemode: gamemode || "Roleplay",
          language: language || "English",
          players,
          maxPlayers,
          ping,
          rules: {},
        });
      }).catch(() => {
        fail();
      });
    } catch {
      fail();
    }
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const ip = url.searchParams.get("ip") || "127.0.0.1";
    const port = parseInt(url.searchParams.get("port") || "7777", 10);

    // Validate IP format
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipRegex.test(ip)) {
      return new Response(JSON.stringify({ error: "Invalid IP address" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (port < 1 || port > 65535) {
      return new Response(JSON.stringify({ error: "Invalid port" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const serverInfo = await querySampServer(ip, port, 5000);

    return new Response(JSON.stringify(serverInfo), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
