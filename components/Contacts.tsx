import Icon from "./Icon";
import type { Link as ContactLink } from "../lib/config";

interface Props {
  links: ContactLink[];
  className?: string;
}

export default function Contacts({ links, className }: Props) {
  return (
    <div className={`flex w-full flex-row justify-center ${className ?? ""}`}>
      {links.map(({ name, target, iconName }) => (
        <div className="p-3" key={name}>
          <a href={target} target="_blank" rel="noreferrer">
            {iconName ? <Icon name={iconName} /> : name}
          </a>
        </div>
      ))}
    </div>
  );
}
