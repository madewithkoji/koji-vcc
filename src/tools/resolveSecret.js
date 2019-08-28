const resolveSecret = (key) => {
  if (!process || !process.env || !process.env.KOJI_SECRETS) {
    return null;
  }
  try {
    const parsedSecrets = JSON.parse(process.env.KOJI_SECRETS);
    return parsedSecrets[key] || null;
  } catch (err) {
    //
  }
  return null;
};

export default resolveSecret;
