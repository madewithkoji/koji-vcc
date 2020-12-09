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

  // For objects stored on koji CDN, you can generate a signed URL to serve
  // them without exposing a permanent URI. End users can obviously still
  // download and rehost the content, or screenshot it/etc (anyone sufficiently
  // dedicated can rip anything...), but this provides an easy way to filter out
  // lazy attackers.
  //
  // Pass in the full URL of a resource to return a url that
  // looks like `https://objects.koji-cdn.com/signed/TOKEN` (note that HLS video
  // URLs will look different than this). If expirySeconds is left undefined,
  // signed videos expire after 1 hour, and any other resource expires after 5
  // minutes. If you wish to apply querystring parameters to use the image
  // api (?width=, etc.), apply those parameters to the signed URL, not to the
  // resource argument.
  async generateSignedUrl(resource, expirySeconds) {
    const request = await fetch(
      this.buildUri('/v1/cdn/signedRequest/create'),
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Koji-Project-Id': this.projectId,
          'X-Koji-Project-Token': this.projectToken
        },
        body: JSON.stringify({
          resource,
          expirySeconds,
        }),
      },
    );
    const { url } = await request.json();
    return url;
  }

  buildUri(path) {
    if (process.env.NODE_TEST) {
      return `http://localhost:3129${path}`;
    }
    return `https://rest.api.gokoji.com${path}`;
  }
}
