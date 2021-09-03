// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

export const getRepoName = (url = '') => {
  // git+https://github.com/facebook/react.git
  return url.replace('git+', '').replace('git://github.com/', '').replace('https://github.com/', '').replace('.git', '');
}

export const getReleases = async (repoName, page = 1) => {
  return await fetch(`https://api.github.com/repos/${repoName}/releases?page=${page}`).then(response => response.json());
}

export default async function handler(req, res) {
  const { packageName, page } = req.query;
  const packageInfo = await fetch(`https://registry.npmjs.org/${packageName}`).then(response => response.json());
  // TODO: Check packageInfo?.repository.type === git
  const repoName = getRepoName(packageInfo?.repository?.url);
  if (!packageInfo?.repository?.url) {
    res.status(400).json({
      ok: false,
      message: 'Not Found'
    });
    return;
  }

  const releases = await getReleases(repoName, page);

  if (releases.message) {
    res.status(400).json({
      ok: false,
      message: releases.message
    });
    return;
  }

  res.status(200).json(releases);
}
