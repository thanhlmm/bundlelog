import { getRepoName } from './changelog';

export default async function handler(req, res) {
  const { packageName } = req.query;
  const packageInfo = await fetch(`https://registry.npmjs.org/${packageName}`).then(response => response.json());

  // Remove large object
  delete packageInfo.versions;
  const repoName = getRepoName(packageInfo?.repository?.url);

  res.status(200).json({ ...packageInfo, repoName });
}
