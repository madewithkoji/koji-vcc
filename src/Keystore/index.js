import fetch from 'node-fetch';

/* eslint-disable class-methods-use-this */
export default class Keystore {
  constructor(projectId, projectToken) {
    this.projectId = projectId || process.env.KOJI_PROJECT_ID;
    this.projectToken = projectToken || process.env.KOJI_PROJECT_TOKEN;

    if (!this.projectId || !this.projectToken) {
      throw new Error('Missing project ID or token');
    }
  }

  async resolveValue(keyPath) {
    const request = await fetch(
      this.buildUri('/v1/keystore/get'),
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scope: this.projectId,
          token: this.projectToken,
          keyPath,
        }),
      },
    );
    const { decryptedValue } = await request.json();
    return decryptedValue;
  }

  buildUri(path) {
    if (process.env.NODE_TEST) {
      return `http://localhost:3129${path}`;
    }
    return `https://rest.api.gokoji.com${path}`;
  }
}
