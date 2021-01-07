import Icon from "./Icon";

export type SocialProps = {
  [key: string]: string;
};

const urls = {
  twitter: "https://twitter.com/",
  github: "https://github.com/",
  facebook: "https://facebook.com/",
  instagram: "https://instagram.com/",
  rss: "/",
  // keybase: "https://keybase.com/",
  mail: "mailto:",
};

const Social = ({ name, username }: SocialProps) => {
  let url = username;

  if (urls[name]) {
    url = `${urls[name]}${username}`;
  }

  return (
    <a href={url} target='blank'>
      <Icon name={name as any} />
    </a>
  );
};

export default Social;
