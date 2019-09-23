const resolveSecret = (key) => {
  if (!process || !process.env || !process.env.KOJI_SECRETS) {
    return null;
  }
  try {
    const parsedSecrets = JSON.parse(process.env.KOJI_SECRETS);

    // Throw an error if we don't have this secret
    if (!parsedSecrets[key]) {
      console.warn(`[@withkoji/vcc] Unable to resolve decrypted value for "${key}". Secret is not present in environment.`);
    }

    return parsedSecrets[key] || null;
  } catch (err) {
    console.warn('[@withkoji/vcc] No KOJI_SECRETS environment variable detected. Try closing this terminal window and opening a new tab.');
  }
  return null;
};

export default resolveSecret;
