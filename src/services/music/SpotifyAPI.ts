/**
 * To use, set up an API and enter (hashed) clientSecret and clientId
 *
 * https://developer.spotify.com/dashboard
 *
 * To hash: https://stackblitz.com/edit/vitejs-vite-8yp6f3
 */

const hashedSecret = ''; //Redacted even so;
const hashedClientId = ''; //Redacted even so;

async function getAccessToken(clientId: string, clientSecret: string) {
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: 'Basic ' + btoa(clientId + ':' + clientSecret),
    },
    body: 'grant_type=client_credentials',
  });

  const data = await response.json();
  return data.access_token;
}

/**
 * This works, but requires premium
 */
export async function playMusic(password: string) {
  // todo... don't do this every time - keep a copy / check for expired
  const secret = getOriginalSecret(password, hashedSecret);
  const clientId = getOriginalSecret(password, hashedClientId);
  const accessToken = await getAccessToken(clientId, secret);

  const response = await fetch('https://api.spotify.com/v1/me/player/play', {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      // Note this is a hardcoded track
      uris: ['spotify:track:2GW2qcpzaRrErv4Nd8NSCH'],
    }),
  });

  if (response.ok) {
    console.log('Music is playing');
  } else {
    console.error('Failed to play music', response.status, response.statusText);
  }
}

function getOriginalSecret(password: string, hashedValue: string) {
  function addStrings(str1: string, str2: string, op: number = 1) {
    let result = '';

    if (str1.length !== str2.length) {
      throw new Error('Input strings must have the same length');
    }

    for (let i = 0; i < str1.length; i++) {
      const sumCharCode =
        (str1.charCodeAt(i) - 32 + op * (str2.charCodeAt(i) - 32) + 95) % 95;
      result += String.fromCharCode(sumCharCode + 32);
    }

    return result;
  }
  return addStrings(
    hashedValue,
    String(password)
      .repeat(Math.floor(hashedValue.length / password.length) + 1)
      .slice(0, hashedValue.length)
  );
}
