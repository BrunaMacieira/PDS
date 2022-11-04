function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

(async () => {
  const token_res = await fetch('/authenticate', {
    method: 'POST',
    credentials: 'include',
    headers: {
      Authorization: `Basic ${btoa('foobar:foobar')}`,
      'Content-Type': 'application/json'
    }
  });

  const token = await token_res.json();
  console.log('token: ', token);

  //register service worker
  const register = await navigator.serviceWorker.register('/worker.js', {
    scope: '/'
  });

  //register push
  const subscription = await register.pushManager.subscribe({
    userVisibleOnly: true,

    //public vapid key
    applicationServerKey: urlBase64ToUint8Array('BE4YGYnNT9BKpXawtBUHn2RQMchBas-KXGZXp1xytZ0j5dn_lH1aj6BVSveT_HAiEthXNidwTHczo7NPebP2oc4')
  });

  //Send push notification
  await fetch("/subscribe", {
    method: "POST",
    body: JSON.stringify(subscription),
    headers: {
      "content-type": "application/json",
      "Authorization": `Bearer ${token.token}`
    }
  });
})();