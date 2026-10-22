let loaderPromise = null;
let loadedKey = '';

export function resetGoogleMapsLoader() {
  loaderPromise = null;
  loadedKey = '';
}

export async function loadGoogleMaps({ apiKey, locale = 'en', timeoutMs = 15_000 }) {
  if (typeof window === 'undefined') throw new Error('not_configured');
  if (!apiKey) throw new Error('not_configured');
  if (window.google?.maps?.Map) return window.google.maps;
  if (loaderPromise && loadedKey === apiKey) return loaderPromise;

  loadedKey = apiKey;
  loaderPromise = new Promise((resolve, reject) => {
    const callbackName = '__wonderfulLombokGoogleMapsReady';
    const script = document.createElement('script');
    const timeout = window.setTimeout(() => {
      cleanup();
      reject(new Error('network'));
    }, timeoutMs);

    function cleanup() {
      window.clearTimeout(timeout);
      script.remove();
      delete window[callbackName];
    }

    window[callbackName] = async () => {
      try {
        if (window.google?.maps?.importLibrary) await window.google.maps.importLibrary('maps');
        cleanup();
        resolve(window.google.maps);
      } catch {
        cleanup();
        reject(new Error('network'));
      }
    };

    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&language=${encodeURIComponent(locale)}&region=ID&loading=async&auth_referrer_policy=origin&callback=${callbackName}`;
    script.async = true;
    script.onerror = () => {
      cleanup();
      reject(new Error('network'));
    };
    document.head.appendChild(script);
  });
  loaderPromise = loaderPromise.catch((error) => {
    loaderPromise = null;
    loadedKey = '';
    throw error;
  });

  return loaderPromise;
}
