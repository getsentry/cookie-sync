import * as React from "react";
import cmp from "semver-compare";

import packageJSON from "../../package.json";

enum VersionStatus {
  Unknown,
  Loading,
  UpToDate,
  Behind,
}

function useReleasedVersions({ currentVersion }: { currentVersion: string }) {
  const [{ status, data }, setReleases] = React.useState<{
    status: number;
    data: undefined | {[key: string]: unknown; tag_name: string}[];
  }>({
    status: 0,
    data: undefined,
  });

  const fetchReleases = async () => {
    const response = await fetch(
      "https://api.github.com/repos/getsentry/hackweek-cookie-sync/releases"
    );
    setReleases({
      status: response.status,
      data: await response.json(),
    });
  };

  React.useEffect(() => {
    fetchReleases();
  }, []);

  if (status === 0) {
    return { status: VersionStatus.Loading };
  } else if (status >= 200 && status < 300) {
    const tags = data?.map((release) => release.tag_name.replace(/^v/, ""));
    const newestRelease = tags?.sort(cmp).pop() || '0.0.0';
    return cmp(newestRelease, currentVersion) === 1
      ? { status: VersionStatus.Behind }
      : { status: VersionStatus.UpToDate };
  } else if (status >= 400) {
    return { status: VersionStatus.Behind };
  } else {
    return { status: VersionStatus.Unknown };
  }
}

export default function VersionBadge() {
  const { status } = useReleasedVersions({
    currentVersion: packageJSON.version,
  });

  switch (status) {
    case VersionStatus.Loading:
      return (
        <div className="current-version">
          <div className="spinner" />
          Your version: {packageJSON.version}
        </div>
      );
    case VersionStatus.UpToDate:
      return (
        <div className="current-version">
          Your version (up to date): {packageJSON.version}
        </div>
      );
    case VersionStatus.Behind:
      return (
        <div className="current-version">
          <div>Your version: {packageJSON.version}</div>
          <div>
            A{" "}
            <a
              href="https://github.com/getsentry/hackweek-cookie-sync/releases"
              target="_blank"
            >
              newer version
            </a>{" "}
            is available
          </div>
        </div>
      );
    default:
      return null;
  }
}
