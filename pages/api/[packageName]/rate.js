import { getRepoName } from './changelog';
const WorkersKVREST = require('@sagi.io/workers-kv')
const merge = require('lodash/merge');

const cfAccountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const cfAuthToken = process.env.CLOUDFLARE_AUTH_TOKEN;
const namespaceId = process.env.CLOUDFLARE_KV_NAMESPACEID || '9f92e008a977489fa0d7c3101768245b';

const WorkersKV = new WorkersKVREST({ cfAccountId, cfAuthToken, namespaceId });


const parseData = (input) => {
  const defaultData = {
    change: {
      1: 0,
      2: 0,
      3: 0,
      4: 0
    },
    impact: {
      1: 0,
      2: 0,
      3: 0,
    }
  }
  try {
    return merge(defaultData, JSON.parse(input))
  } catch (error) {
    return defaultData;
  }
}

export default async function handler(req, res) {
  const { packageName, version } = req.query;
  const KEY = `${packageName}_${version}`;

  const versionData = parseData(await WorkersKV.readKey({ key: KEY }));
  if (req.method === 'GET') {
    return res.status(200).json(versionData);
  }

  const { action, data, oldData } = req.body;
  if (data === oldData) {
    // No change
    return res.status(200).json(versionData);
  }

  switch (action) {
    case 'change':
      versionData.change[data] += 1;
      if (oldData && versionData.change[oldData] > 0) {
        versionData.change[oldData] -= 1;
      }
      break;
    case 'impact':
      versionData.impact[data] += 1;
      if (oldData && versionData.impact[oldData] > 0) {
        versionData.impact[oldData] -= 1;
      }
      break;
    default:
      throw new Error('Missing payload.action [change | impact]');
  }

  console.log(versionData);

  res.status(200).json(versionData);
  await WorkersKV.writeKey({ key: KEY, value: JSON.stringify(versionData) });
}
