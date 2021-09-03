// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

export const getRepoName = (url = '') => {
  // git+https://github.com/facebook/react.git
  return url.replace('git+', '').replace('https://github.com/', '').replace('.git', '');
}

export const getReleases = async (repoName, page = 1) => {
  return await fetch(`https://api.github.com/repos/${repoName}/releases?page=${page}`).then(response => response.json());
}

export default async function handler(req, res) {
  const { packageName, page } = req.query;
  const packageInfo = await fetch(`https://registry.npmjs.org/${packageName}`).then(response => response.json());
  // TODO: Check packageInfo?.repository.type === git
  const repoName = getRepoName(packageInfo?.repository?.url);

  const releases = await getReleases(repoName, page);

  res.status(200).json(releases);
}
