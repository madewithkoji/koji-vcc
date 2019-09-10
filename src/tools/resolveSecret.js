const resolveSecret = (key) => {
  try {
    const parsedSecrets = JSON.parse(process.env.KOJI_SECRETS);
    return parsedSecrets[key] || null;
  } catch (err) {
    const error = new Error(
      `[@withkoji/vcc] ${err.message}\nPlease verify that you've defined an environment variable named KOJI_SECRETS`,
    );
    error.stack = err.stack;
    throw err;
  }
};

export default resolveSecret;
